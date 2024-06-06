import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { Sidebar } from 'primereact/sidebar';
import { classNames } from 'primereact/utils';
import React, { useContext, useEffect, useState } from 'react';
import { LayoutContext } from './context/layoutcontext';

const AppConfig = (props) => {
    const [scales] = useState([12, 13, 14, 15, 16]);
    const { layoutConfig, setLayoutConfig, layoutState, setLayoutState } = useContext(LayoutContext);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    const onConfigButtonClick = () => {
        setLayoutState((prevState) => ({ ...prevState, configSidebarVisible: true }));
    };

    const onConfigSidebarHide = () => {
        setLayoutState((prevState) => ({ ...prevState, configSidebarVisible: false }));
    };

    const changeMenuMode = (e) => {
        setLayoutConfig((prevState) => ({ ...prevState, menuMode: e.value }));
    };

    const changeTheme = (theme, colorScheme) => {
        const themeLink = document.getElementById('theme-css');
        const themeHref = themeLink ? themeLink.getAttribute('href') : null;
        const newHref = themeHref ? themeHref.replace(themeHref.split('/')[2], theme) : null;
        replaceLink(themeLink, newHref, () => {
            setLayoutConfig((prevState) => ({ ...prevState, theme, colorScheme }));
        });
    };

    const replaceLink = (linkElement, href, onComplete) => {
        if (!linkElement || !href) {
            return;
        }

        const id = linkElement.getAttribute('id');
        const cloneLinkElement = linkElement.cloneNode(true);

        cloneLinkElement.setAttribute('href', href);
        cloneLinkElement.setAttribute('id', id + '-clone');

        linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);

        cloneLinkElement.addEventListener('load', () => {
            linkElement.remove();

            const element = document.getElementById(id); // re-check
            element && element.remove();

            cloneLinkElement.setAttribute('id', id);
            onComplete && onComplete();
        });
    };

    const decrementScale = () => {
        setLayoutConfig((prevState) => ({ ...prevState, scale: prevState.scale - 1 }));
    };

    const incrementScale = () => {
        setLayoutConfig((prevState) => ({ ...prevState, scale: prevState.scale + 1 }));
    };

    const applyScale = () => {
        document.documentElement.style.fontSize = layoutConfig.scale + 'px';
    };


    useEffect(() => {
        applyScale();
    }, [layoutConfig.scale]);

    useEffect(() => {
        let pageStyles = localStorage.getItem('pageStyles')
        if (pageStyles) {
            pageStyles = JSON.parse(pageStyles)
            changeTheme(pageStyles.theme, pageStyles.colorScheme)
            setLayoutConfig(pageStyles)
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('pageStyles', JSON.stringify(layoutConfig))
    }, [layoutConfig])

    return (
        <>
            <button className="layout-config-button p-link" type="button" onClick={onConfigButtonClick} >
                <i className="pi pi-cog"></i>
            </button>

            <Sidebar visible={layoutState.configSidebarVisible} onHide={onConfigSidebarHide} position="right" className="layout-config-sidebar w-20rem">
                <h5>Zoom</h5>
                <div className="flex align-items-center">
                    <Button icon="pi pi-minus" type="button" onClick={decrementScale} className="p-button-text p-button-rounded w-2rem h-2rem mr-2" disabled={layoutConfig.scale === scales[0]}></Button>
                    <div className="flex gap-2 align-items-center">
                        {scales.map((item) => {
                            return <i className={classNames('pi pi-circle-fill', { 'text-primary-500': item === layoutConfig.scale, 'text-300': item !== layoutConfig.scale })} key={item}></i>;
                        })}
                    </div>
                    <Button icon="pi pi-plus" type="button" onClick={incrementScale} className="p-button-text p-button-rounded w-2rem h-2rem ml-2" disabled={layoutConfig.scale === scales[scales.length - 1]}></Button>
                </div>

                {!props.simple &&
                    <>
                        <h5>Tipo de Menú</h5>
                        <div className="flex">
                            <div className="field-radiobutton flex-1">
                                <RadioButton name="menuMode" value={'static'} checked={layoutConfig.menuMode === 'static'} onChange={(e) => changeMenuMode(e)} inputId="mode1"></RadioButton>
                                <label htmlFor="mode1">Estático</label>
                            </div>
                            <div className="field-radiobutton flex-1">
                                <RadioButton name="menuMode" value={'overlay'} checked={layoutConfig.menuMode === 'overlay'} onChange={(e) => changeMenuMode(e)} inputId="mode2"></RadioButton>
                                <label htmlFor="mode2">Oculto</label>
                            </div>
                        </div>
                    </>
                }

                <h5>Modo de Pantalla</h5>
                <div className="flex">
                    <div className="field-radiobutton flex-1">
                        <RadioButton name="menuMode" value={'light'} checked={layoutConfig.colorScheme === 'light'} onChange={(e) => changeTheme('lara-light-indigo', 'light')} inputId="mode3"></RadioButton>
                        <label htmlFor="mode3">Claro</label>
                    </div>
                    <div className="field-radiobutton flex-1">
                        <RadioButton name="menuMode" value={'dark'} checked={layoutConfig.colorScheme === 'dark'} onChange={(e) => changeTheme('bootstrap4-dark-blue', 'dark')} inputId="mode4"></RadioButton>
                        <label htmlFor="mode4">Oscuro</label>
                    </div>
                </div>
            </Sidebar>
        </>
    );
};

export default AppConfig;
