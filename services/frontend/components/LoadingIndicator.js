// src/components/LoadingIndicator.js
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const LoadingIndicator = () => {
    return (
        <div className="flex items-center justify-center p-4">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-lg font-medium text-gray-700">Generando...</span>
        </div>
    );
};

export default LoadingIndicator;