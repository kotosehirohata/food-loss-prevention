export default function Card({ children, title, className = '' }) {
    return (
      <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>
        {title && (
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
          </div>
        )}
        <div className="px-4 py-5 sm:p-6">{children}</div>
      </div>
    );
  }