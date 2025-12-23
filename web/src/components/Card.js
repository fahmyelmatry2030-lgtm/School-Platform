import { jsx as _jsx } from "react/jsx-runtime";
export const Card = ({ children, className = '', hover = false }) => {
    return (_jsx("div", { className: `card ${hover ? 'card-hover' : ''} ${className}`, children: children }));
};
export const CardHeader = ({ children, className = '' }) => {
    return _jsx("div", { className: `card-header ${className}`, children: children });
};
export const CardTitle = ({ children, className = '' }) => {
    return _jsx("h3", { className: `card-title ${className}`, children: children });
};
export const CardContent = ({ children, className = '' }) => {
    return _jsx("div", { className: `card-content ${className}`, children: children });
};
