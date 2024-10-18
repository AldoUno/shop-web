import React from 'react';

const AppFooter = () => {
    return (
        <div className="layout-footer">
            © Copyright {new Date().getFullYear()} | Desarrollado por
            <span className="font-medium ml-2">Sady Méndez & Pamela Villalba</span>
        </div>
    );
};

export default AppFooter;
