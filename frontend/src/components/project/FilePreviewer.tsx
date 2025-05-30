// frontend/src/components/project/FilePreviewer.tsx
import React, { useState } from 'react'; // Added useState for potential iframe loading state
import type { ProjectFile, FileType as ProjectFileTypeEnum } from '../../types/project';
import { DocumentTextIcon, PhotoIcon, CodeBracketIcon, CubeTransparentIcon } from '@heroicons/react/24/outline'; // Added more icons
import { cn } from '../../lib/utils'; // For conditional classes

interface FilePreviewerProps {
  file: ProjectFile;
}

const getFileIcon = (type: ProjectFileTypeEnum) => {
  // ... (existing getFileIcon logic)
  switch (type) {
    case 'PDF': return <DocumentTextIcon className="w-6 h-6 text-red-500" />;
    case 'IMAGE': return <PhotoIcon className="w-6 h-6 text-blue-500" />;
    case 'CODE': return <CodeBracketIcon className="w-6 h-6 text-green-500" />;
    case 'AUTOCAD': return <CubeTransparentIcon className="w-6 h-6 text-purple-500" />;
    // Add more specific icons if you have them
    // case 'VIDEO': return <FilmIcon className="w-6 h-6 text-orange-500" />;
    // case 'AUDIO': return <MusicalNoteIcon className="w-6 h-6 text-pink-500" />;
    default: return <DocumentTextIcon className="w-6 h-6 text-gray-500" />;
  }
};

// Helper to determine if we should use an external viewer
const isOfficeDocument = (filename: string): boolean => {
  const lowerFilename = filename.toLowerCase();
  return lowerFilename.endsWith('.doc') || lowerFilename.endsWith('.docx') ||
         lowerFilename.endsWith('.xls') || lowerFilename.endsWith('.xlsx') ||
         lowerFilename.endsWith('.ppt') || lowerFilename.endsWith('.pptx');
};

const isGoogleViewerSupported = (filename: string): boolean => {
  const lowerFilename = filename.toLowerCase();
  return isOfficeDocument(filename) || // Office docs can also be viewed by Google
         lowerFilename.endsWith('.pdf') ||
         lowerFilename.endsWith('.tiff') || lowerFilename.endsWith('.tif') ||
         lowerFilename.endsWith('.svg') ||
         lowerFilename.endsWith('.ps') || // PostScript
         lowerFilename.endsWith('.txt') || // Basic text
         lowerFilename.endsWith('.rtf');
         // Google Viewer might support more, this is a common subset
};


const FilePreviewer: React.FC<FilePreviewerProps> = ({ file }) => {
  const [iframeLoading, setIframeLoading] = useState(true); // For iframe loading state
  // const [useExternalViewer, setUseExternalViewer] = useState<'google' | 'microsoft' | 'none'>('none');

  const encodedFileUrl = encodeURIComponent(file.file_url || '');
  const googleViewerUrl = `https://docs.google.com/gview?url=${encodedFileUrl}&embedded=true`;
  const microsoftViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedFileUrl}`;

  // Decide which viewer to use, or if direct rendering is better
  // This logic can be refined
  let viewerToUse: 'google' | 'microsoft' | 'none' = 'none';
  if (file.file_url) {
      if (isOfficeDocument(file.original_filename)) {
          viewerToUse = 'microsoft'; // Prefer Microsoft for its own formats
      } else if (isGoogleViewerSupported(file.original_filename)) {
          viewerToUse = 'google';
      }
  }


  const renderPreview = () => {
    if (!file.file_url) {
      return <p className="text-sm text-gray-500">File URL not available.</p>;
    }

    // Native browser preview for images (usually best)
    if (file.file_type === 'IMAGE') {
      return (
        <img
          src={file.file_url}
          alt={file.original_filename}
          className="my-2 max-w-full h-auto rounded-md shadow-md"
          style={{ maxHeight: '500px' }} // Limit image height
        />
      );
    }

    // Use external viewers for supported document types
    if (viewerToUse === 'microsoft') {
      return (
        <div className="my-2 w-full aspect-video md:aspect-[4/3] lg:h-[600px] relative">
          {iframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <p className="text-gray-500 dark:text-gray-300">Loading Microsoft Viewer...</p>
            </div>
          )}
          <iframe
            src={microsoftViewerUrl}
            width="100%"
            height="100%" // Ensure parent has height or use aspect ratio
            frameBorder="0"
            onLoad={() => setIframeLoading(false)}
            className={cn(iframeLoading ? "opacity-0" : "opacity-100", "transition-opacity duration-500")}
            title={`Microsoft View of ${file.original_filename}`}
          >
            Your browser does not support iframes.
          </iframe>
        </div>
      );
    }

    if (viewerToUse === 'google') {
      return (
        <div className="my-2 w-full aspect-video md:aspect-[4/3] lg:h-[600px] relative">
           {iframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <p className="text-gray-500 dark:text-gray-300">Loading Google Viewer...</p>
            </div>
          )}
          <iframe
            src={googleViewerUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            onLoad={() => setIframeLoading(false)}
            className={cn(iframeLoading ? "opacity-0" : "opacity-100", "transition-opacity duration-500")}
            title={`Google View of ${file.original_filename}`}
          >
            Your browser does not support iframes.
          </iframe>
        </div>
      );
    }

    // Fallback for other types (CODE, AUTOCAD, etc.) or if external viewers are not chosen
    switch (file.file_type) {
      case 'CODE':
        return (
          <div className="my-2">
            <p className="text-sm text-gray-500 mb-1">Code file. Enhanced preview coming soon.</p>
            <a
              href={file.file_url}
              download={file.original_filename}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Download {file.original_filename}
            </a>
          </div>
        );
      case 'AUTOCAD':
        return (
          <div className="my-2">
            <p className="text-sm text-gray-500 mb-1">AutoCAD file. Enhanced preview coming soon.</p>
            <a
              href={file.file_url}
              download={file.original_filename}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Download {file.original_filename}
            </a>
          </div>
        );
      default: // Includes 'PDF' if not handled by Google Viewer, or 'OTHER'
        return (
          <div className="my-2">
            <p className="text-sm text-gray-500 mb-1">
              {file.file_type === 'PDF' ? 'PDF Document.' : 'No direct preview available for this file type.'}
            </p>
            <a
              href={file.file_url}
              download={file.original_filename}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Download {file.original_filename}
            </a>
             {/* You could offer a Google Viewer link as a fallback even if iframe isn't used by default */}
             {file.file_type === 'PDF' && !isGoogleViewerSupported(file.original_filename) && ( // Or if you want to always offer it for PDFs
                 <a
                     href={googleViewerUrl.replace('&embedded=true','')} // Non-embedded link
                     target="_blank"
                     rel="noopener noreferrer"
                     className="ml-4 text-sm text-gray-500 hover:underline"
                 >
                     (Try Google Viewer)
                 </a>
             )}
          </div>
        );
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg mb-4 shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center min-w-0"> {/* Added min-w-0 for better truncation */}
          {getFileIcon(file.file_type)}
          <span className="ml-3 font-medium text-gray-800 dark:text-gray-200 truncate" title={file.original_filename}>
            {file.original_filename}
          </span>
        </div>
        <div className="flex-shrink-0 ml-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{file.file_type}</span>
             {/* Link to directly download the file */}
            <a
                href={file.file_url}
                download={file.original_filename}
                className="ml-3 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                title="Download file"
            >
                (Download)
            </a>
        </div>
      </div>
      {renderPreview()}
    </div>
  );
};

export default FilePreviewer;