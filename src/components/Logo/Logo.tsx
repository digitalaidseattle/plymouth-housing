import { VITE_APPLICATION_NAME } from '../../types/constants';
import logo from '/src/assets/images/ply_icon_white_goldbkgrnd.svg';

const Logo = () => {
  return <img src={logo} alt={VITE_APPLICATION_NAME} width="50" />;
};

export default Logo;
