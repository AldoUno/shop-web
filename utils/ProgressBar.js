import { ProgressBar } from 'primereact/progressbar';
import { useSelector } from 'react-redux';

const Progreso = () => {
    const value = useSelector(state => state.progreso)
    return (
        <ProgressBar mode="indeterminate" style={{ height: `${value}`, borderRadius: 'initial', position: 'absolute', width: '100%', top: '0', left: '0' }} />
    )
}

export default Progreso