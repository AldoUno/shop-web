import React from 'react';

const AppFooter = () => {
    return (
        <div className="layout-footer">
            © Copyright {new Date().getFullYear()} | Desarrollado por
            <span className="font-medium ml-2">SerCon </span>
        </div>
    );
};

export default AppFooter;
