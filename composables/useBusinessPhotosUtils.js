// composables/useBusinessPhotosUtils.js
export const useBusinessPhotosUtils = () => {
    // Validate image file before upload
    const validateImageFile = (file) => {
        const errors = [];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        if (!file) errors.push('No file selected');
        if (file?.size > maxSize) errors.push('File exceeds 10MB limit');
        if (!allowedTypes.includes(file?.type)) {
            errors.push('Invalid file type. Allowed: JPEG, PNG, WEBP, GIF');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    };

    // Generate image preview URL using FileReader
    const createPreview = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    // Generate multiple previews with validation
    const createPreviews = async (files) => {
        const previews = [];

        for (const file of files) {
            const validation = validateImageFile(file);

            try {
                const preview = validation.valid ? await createPreview(file) : null;

                previews.push({
                    file,
                    url: preview, // Changed from 'preview' to 'url' to match component
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    valid: validation.valid,
                    error: validation.valid ? null : validation.errors.join(', ')
                });
            } catch (err) {
                previews.push({
                    file,
                    url: null,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    valid: false,
                    error: 'Failed to create preview'
                });
            }
        }

        return previews;
    };

    // Format file size helper
    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';

        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const exp = Math.floor(Math.log(bytes) / Math.log(1024));
        const size = (bytes / Math.pow(1024, exp)).toFixed(exp === 0 ? 0 : 1);

        return `${size} ${units[exp]}`;
    };

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';

        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Invalid Date';
        }
    };

    // Check if file is image
    const isImageFile = (file) => {
        return file && file.type && file.type.startsWith('image/');
    };

    // Get image dimensions
    const getImageDimensions = (file) => {
        return new Promise((resolve) => {
            if (!isImageFile(file)) {
                resolve({ width: 0, height: 0 });
                return;
            }

            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve({ width: img.width, height: img.height });
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve({ width: 0, height: 0 });
            };

            img.src = url;
        });
    };

    return {
        validateImageFile,
        createPreview,
        createPreviews,
        formatFileSize,
        formatDate,
        isImageFile,
        getImageDimensions
    };
};