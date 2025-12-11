import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';

interface LogoUploaderProps {
  currentLogoSrc: string | null;
  onLogoUpload: (base64Image: string) => void;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ currentLogoSrc, onLogoUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoSrc);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (e.g., .png, .jpg, .jpeg).');
        setSelectedFile(null);
        setPreviewUrl(currentLogoSrc);
        return;
      }
      setError(null);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(currentLogoSrc);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setError('No file selected for upload.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onLogoUpload(reader.result);
          alert('Logo uploaded successfully!');
          setSelectedFile(null); // Clear selected file after upload
          // The App component will update currentLogoSrc, which will then update previewUrl
        }
      };
      reader.onerror = () => {
        setError('Failed to read file.');
      };
    } catch (err) {
      setError('An error occurred during upload.');
      console.error('Logo upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Upload Company Logo</h3>
      <div className="mb-4">
        <label htmlFor="logoUpload" className="block text-sm font-medium text-gray-700 mb-1">
          Select Image
        </label>
        <input
          id="logoUpload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {previewUrl && (
        <div className="mb-4">
          <p className="block text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <div className="w-32 h-32 border border-gray-300 rounded-md overflow-hidden flex items-center justify-center">
            <img src={previewUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      )}

      <Button
        onClick={handleUploadClick}
        loading={loading}
        disabled={!selectedFile || loading}
        variant="primary"
      >
        Upload Logo
      </Button>
    </div>
  );
};

export default LogoUploader;