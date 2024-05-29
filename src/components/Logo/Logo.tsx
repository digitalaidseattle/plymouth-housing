/**
 *  Logo.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
// material-ui


import logo from '/src/assets/images/logo-dark.png';


// ==============================|| LOGO SVG ||============================== //

const Logo = () => {
  return (
    <img src={logo} alt={import.meta.env.VITE_APPLICATION_NAME} width="50" />
  )
}

export default Logo;
