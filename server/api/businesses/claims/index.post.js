// server/api/business-claims.post.js
import { defineEventHandler, readMultipartFormData, createError } from 'h3';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import { z } from 'zod';

const claimSchema = z.object({
    business_id: z.coerce.number().positive(),
    role: z.string().min(1)
});

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event);
    const user = await serverSupabaseUser(event);

    try {
        if (!user) {
            throw createError({ statusCode: 401, message: 'Unauthorized' });
        }

        const formData = await readMultipartFormData(event);
        const parsedData = {};
        let file = null;

        // Parse form data
        for (const part of formData || []) {
            if (part.name === 'file' && part.filename) {
                file = new File([part.data], part.filename, { type: part.type });
            } else if (part.name) {
                parsedData[part.name] = part.data.toString();
            }
        }

        // Validate inputs
        const parsed = claimSchema.safeParse(parsedData);
        if (!parsed.success) {
            throw createError({
                statusCode: 400,
                message: parsed.error.errors[0].message
            });
        }

        // Verify business exists
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .select('id')
            .eq('id', parsed.data.business_id)
            .single();

        if (businessError || !business) {
            throw createError({ statusCode: 404, message: 'Business not found' });
        }

        // Check for existing claim
        const { data: existingClaim, error: claimCheckError } = await supabase
            .from('business_claims')
            .select('id')
            .eq('user_id', user.id)
            .eq('business_id', parsed.data.business_id)
            .single();

        if (!claimCheckError) {
            // A claim already exists
            throw createError({
                statusCode: 409,
                message: 'You have already claimed this business',
            });
        }

        if (claimCheckError.code && claimCheckError.code !== 'PGRST116') {
            // Some other unexpected error
            console.error("Error checking claim:", claimCheckError);
            throw createError({
                statusCode: 500,
                message: 'Could not verify existing claims',
            });
        }
            

        // Handle file upload
        let documentUrl = null;
        if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `business_claims/business_id-${parsed.data.business_id}/user-${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('verification-docs')
                .upload(filePath, file);

            if (uploadError) {
                throw createError({
                    statusCode: 500,
                    message: 'File upload failed: ' + uploadError.message
                });
            }

            const { data: urlData } = supabase.storage
                .from('verification-docs')
                .getPublicUrl(filePath);

            documentUrl = urlData.publicUrl;
        }

        // Create claim
        const { error: claimError } = await supabase
            .from('business_claims')
            .insert({
                business_id: parsed.data.business_id,
                user_id: user.id,
                status: 'pending',
                business_role: parsed.data.role,
                verification_document: documentUrl
            });

        if (claimError) {
            throw createError({
                statusCode: 500,
                message: 'Claim creation failed: ' + claimError.message
            });
        }

        return { success: true };

    } catch (error) {
        console.error('Business claim error:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Internal server error'
        });
    }
});