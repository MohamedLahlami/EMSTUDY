import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import MDEditor from '@uiw/react-md-editor';
import { Upload, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const AddMaterialForm = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('text');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
    },
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let materialContent = content;
    if (type === 'pdf' && file) {
      // In a real app, this would upload the file to a server
      materialContent = URL.createObjectURL(file);
    }

    onSubmit({
      title,
      description,
      type,
      content: materialContent,
      availableFrom,
      availableTo: availableTo || null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        fullWidth
      />

      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        fullWidth
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Material Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="text">Text</option>
          <option value="pdf">PDF</option>
          <option value="link">Link</option>
          <option value="video">Video</option>
        </select>
      </div>

      {type === 'text' ? (
        <div data-color-mode="light">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <MDEditor
            value={content}
            onChange={setContent}
            preview="edit"
            height={300}
          />
        </div>
      ) : type === 'pdf' ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Drag & drop a PDF file here, or click to select
              </p>
            </>
          )}
        </div>
      ) : (
        <Input
          label={type === 'link' ? 'URL' : 'Video URL'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          type="url"
          required
          fullWidth
          placeholder={type === 'link' ? 'https://example.com' : 'https://youtube.com/watch?v=...'}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Available From"
          type="datetime-local"
          value={availableFrom}
          onChange={(e) => setAvailableFrom(e.target.value)}
          required
          fullWidth
        />

        <Input
          label="Available To (Optional)"
          type="datetime-local"
          value={availableTo}
          onChange={(e) => setAvailableTo(e.target.value)}
          fullWidth
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          Add Material
        </Button>
      </div>
    </form>
  );
};

export default AddMaterialForm;