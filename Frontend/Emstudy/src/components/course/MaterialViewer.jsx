import React from 'react';
import ReactMarkdown from 'react-markdown';
import { X } from 'lucide-react';
import Button from '../ui/Button';

const MaterialViewer = ({ material, onClose }) => {
  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    switch (material.type) {
      case 'text':
        return (
          <div className="prose max-w-none">
            <ReactMarkdown>{material.content}</ReactMarkdown>
          </div>
        );
      case 'pdf':
        return (
          <div className="text-center">
            <p className="mb-4">Click below to download the PDF</p>
            <Button
              onClick={() => handleDownload(material.content, `${material.title}.pdf`)}
              variant="primary"
            >
              Download PDF
            </Button>
          </div>
        );
      case 'video':
        return (
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={material.content}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg"
            />
          </div>
        );
      case 'link':
        return (
          <div className="text-center">
            <p className="mb-4">Click below to open the link in a new tab</p>
            <Button
              onClick={() => window.open(material.content, '_blank')}
              variant="primary"
            >
              Open Link
            </Button>
          </div>
        );
      default:
        return <p>Unsupported material type</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{material.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MaterialViewer;