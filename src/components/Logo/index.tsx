import { Link } from 'react-router-dom';

// material-ui
import { ButtonBase } from '@mui/material';

// project import
// import { activeItem } from 'store/reducers/menu';
import Logo from './Logo';
import config from '../../config';

// ==============================|| MAIN LOGO ||============================== //
interface LogoSectionProps {
  sx: object,
  to: string
}

const LogoSection: React.FC<LogoSectionProps> = ({ sx, to }) => {
  // FIXME
  // const { defaultId } = useSelector((state) => state.menu);
  // const dispatch = useDispatch();
  return (
    <ButtonBase
      disableRipple
      component={Link}
      // onClick={() => dispatch(activeItem({ openItem: [defaultId] }))}
      to={!to ? config.defaultPath : to}
      sx={sx}
    >
      <Logo />
    </ButtonBase>
  )
}



export default LogoSection;
