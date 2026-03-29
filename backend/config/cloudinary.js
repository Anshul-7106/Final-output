import { v2 as cloudinary } from 'cloudinary';

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  return cloudinary;
};

// Upload file to cloudinary
export const uploadToCloudinary = async (filePath, folder = 'edtech', resourceType = 'auto') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
      transformation: resourceType === 'image' ? [
        { width: 1280, height: 720, crop: 'limit' },
        { quality: 'auto' }
      ] : undefined
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration || 0
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to cloud storage');
  }
};

// Delete file from cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

// Upload video to cloudinary
export const uploadVideoToCloudinary = async (filePath, folder = 'edtech/videos') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'video',
      chunk_size: 6000000, // 6MB chunks for large files
      eager: [
        { streaming_profile: 'hd', format: 'm3u8' }
      ],
      eager_async: true
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration || 0,
      format: result.format
    };
  } catch (error) {
    console.error('Cloudinary video upload error:', error);
    throw new Error('Failed to upload video to cloud storage');
  }
};

export { cloudinary };
export default configureCloudinary;
