import { jsx as _jsx } from "react/jsx-runtime";
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizeClass = size === 'lg' ? 'spinner-lg' : '';
    return (_jsx("div", { className: `spinner ${sizeClass} ${className}`, role: "status", "aria-label": "Loading", children: _jsx("span", { className: "sr-only", children: "Loading..." }) }));
};
export default LoadingSpinner;
