// server/api/business-photos/index.js
import { z } from 'zod';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import { createHash } from 'crypto';
import { readMultipartFormData } from 'h3';

const createPhotoSchema = z.object({
    business_id: z.number().positive(),
    caption: z.string().optional()
});

const updatePhotoSchema = z.object({
    caption: z.string().optional(),
    approved: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, 'At least one field must be provided');

const generateFileName = (userId, originalName) => {
    const timestamp = Date.now();
    const hash = createHash('md5')
        .update(`${userId}-${timestamp}`)
        .digest('hex')
        .substring(0, 8);
    const extension = originalName.split('.').pop();
    return `${hash}-${timestamp}.${extension}`;
};

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event);
    const user = await serverSupabaseUser(event);
    const query = getQuery(event);
    const photoId = Number(query.id);



    // continue with delete logic...
        const method = getMethod(event);

    // GET - Single photo or list
    if (method === 'GET') {
        try {
            if (photoId) {
                // Get single photo
                const { data, error } = await supabase
                    .from('business_photos')
                    .select('*')
                    .eq('id', photoId)
                    .single();

                if (error) throw error;

                if (data.storage_path) {
                    const { data: urlData } = supabase.storage
                        .from('business-photos')
                        .getPublicUrl(data.storage_path);
                    data.url = urlData.publicUrl;
                }

                return data;
            } else {
                // List all photos for business
                const query = getQuery(event);
                
                const businessId = Number(query.business_id);

                createPhotoSchema.pick({ business_id: true }).parse({ business_id: businessId });

                const { data, error } = await supabase
                    .from('business_photos')
                    .select('*')
                    .eq('business_id', businessId)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const photosWithUrls = await Promise.all(
                    data.map(async (photo) => {
                        if (photo.storage_path) {
                            const { data: urlData } = supabase.storage
                                .from('business-photos')
                                .getPublicUrl(photo.storage_path);
                            return { ...photo, url: urlData.publicUrl };
                        }
                        return photo;
                    })
                );

                return photosWithUrls;
            }
        } catch (error) {
            return createError({
                statusCode: error.code === 'PGRST116' ? 404 : 500,
                statusMessage: error.message
            });
        }
    }

    // POST - Upload photos
    if (method === 'POST') {
        if (!user) return createError({ statusCode: 401, statusMessage: 'Unauthorized' });

        try {
            const formData = await readMultipartFormData(event);
            const files = formData.filter(item =>
                item.name === 'file' || item.name === 'files[]'
            );
            const businessId = Number(formData.find(item => item.name === 'business_id').data.toString());
            const caption = formData.find(item => item.name === 'caption')?.data.toString();

            createPhotoSchema.parse({ business_id: businessId, caption });

            const uploadedPhotos = [];
            const errors = [];

            for (const file of files) {
                try {
                    const fileName = generateFileName(businessId, file.filename);
                    const filePath = `business_photos/business_id-${businessId}/${fileName}`;

                    // Upload to storage
                    const { error: uploadError } = await supabase.storage
                        .from('business-photos')
                        .upload(filePath, file.data, {
                            contentType: file.type,
                            upsert: false
                        });

                    if (uploadError) throw uploadError;

                    // Get public URL
                    const { data: urlData } = supabase.storage
                        .from('business-photos')
                        .getPublicUrl(filePath);

                    // Create database record
                    const { data: dbData, error: dbError } = await supabase
                        .from('business_photos')
                        .insert({
                            business_id: businessId,
                            user_id: user.id,
                            url: urlData.publicUrl,
                            caption,
                            storage_path: filePath
                        })
                        .select()
                        .single();

                    if (dbError) throw dbError;

                    uploadedPhotos.push(dbData);

                } catch (error) {
                    console.error('❌ Upload error for file:', file.filename); // ✅ log file name
                    console.error(error); // ✅ log the full error object
                    errors.push({ filename: file.filename, error: error.message });
                }
            }


            if (errors.length > 0) {
                console.error('📛 Partial upload errors:', errors); // ✅ Summary log
                return createError({
                    statusCode: 500,
                    statusMessage: 'Partial upload failure',
                    data: errors
                });
            }


            return uploadedPhotos;

        } catch (error) {
            return createError({
                statusCode: error.statusCode || 500,
                statusMessage: error.message
            });
        }
    }

    // PUT - Update photo
    if (method === 'PUT') {
        if (!user) return createError({ statusCode: 401, statusMessage: 'Unauthorized' });
        if (!photoId) return createError({ statusCode: 400, statusMessage: 'Photo ID required' });

        try {
            const body = await readBody(event);
            const validated = updatePhotoSchema.parse(body);

            // Verify ownership
            const { data: existing, error: fetchError } = await supabase
                .from('business_photos')
                .select('user_id, storage_path')
                .eq('id', photoId)
                .single();

            if (fetchError) throw fetchError;
            if (existing.user_id !== user.id) return createError({ statusCode: 403 });

            // Update photo
            const { data, error } = await supabase
                .from('business_photos')
                .update({
                    ...validated,
                    updated_at: new Date().toISOString()
                })
                .eq('id', photoId)
                .select()
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            return createError({
                statusCode: error instanceof z.ZodError ? 400 : 500,
                statusMessage: error.message
            });
        }
    }

    // DELETE - Remove photo
    if (method === 'DELETE') {
        if (!user) return createError({ statusCode: 401, statusMessage: 'Unauthorized' });
        if (!photoId) return createError({ statusCode: 400, statusMessage: 'Photo ID required' });

        try {
            // Verify ownership
            const { data: existing, error: fetchError } = await supabase
                .from('business_photos')
                .select('user_id, storage_path')
                .eq('id', photoId)
                .single();

            if (fetchError) throw fetchError;
            if (existing.user_id !== user.id) return createError({ statusCode: 403 });

            // Delete from storage
            if (existing.storage_path) {
                const { error: storageError } = await supabase.storage
                    .from('business-photos')
                    .remove([existing.storage_path]);
                if (storageError) console.error('Storage deletion error:', storageError);
            }

            // Delete database record
            const { error } = await supabase
                .from('business_photos')
                .delete()
                .eq('id', photoId);

            if (error) throw error;

            return { status: 'success', message: 'Photo deleted' };

        } catch (error) {
            return createError({
                statusCode: error.statusCode || 500,
                statusMessage: error.message
            });
        }
    }

    return createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
});