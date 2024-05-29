import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// material-ui
import { Grid, Typography } from '@mui/material';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';

// project imports
import MainCard from '../MainCard';

// ==============================|| BREADCRUMBS ||============================== //
interface PROPS {
  navigation: any,
  title: boolean,
  others?: any
}

const Breadcrumbs: React.FC<PROPS> = ({ navigation, title, others }) => {
  const location = useLocation();
  const [main, setMain] = useState<any>({});
  const [item, setItem] = useState<any>({});

  // set active item state
  const getCollapse = (menu: any) => {
    if (menu.children) {
      menu.children.filter((collapse: any) => {
        if (collapse.type && collapse.type === 'collapse') {
          getCollapse(collapse);
        } else if (collapse.type && collapse.type === 'item') {
          if (location.pathname === collapse.url) {
            setMain(menu);
            setItem(collapse);
          }
        }
        return false;
      });
    }
  };

  useEffect(() => {
    navigation?.items?.map((menu: any) => {
      if (menu.type && menu.type === 'group') {
        getCollapse(menu);
      }
      return false;
    });
  });

  // only used for component demo breadcrumbs
  if (location.pathname === '/breadcrumbs') {
    location.pathname = '/dashboard/analytics';
  }

  let mainContent;
  let itemContent;
  let breadcrumbContent = <Typography />;
  let itemTitle = '';

  // collapse item
  if (main && main.type === 'collapse') {
    mainContent = (
      <Typography component={Link} to={document.location.pathname} variant="h6" sx={{ textDecoration: 'none' }} color="textSecondary">
        {main.title}
      </Typography>
    );
  }

  // items
  if (item && item.type === 'item') {
    itemTitle = item.title;
    itemContent = (
      <Typography variant="subtitle1" color="textPrimary">
        {itemTitle}
      </Typography>
    );

    // main
    if (item.breadcrumbs !== false) {
      breadcrumbContent = (
        <MainCard border={false} sx={{ mb: 3, bgcolor: 'transparent' }} {...others} content={false}>
          <Grid container direction="column" justifyContent="flex-start" alignItems="flex-start" spacing={1}>
            <Grid item>
              <MuiBreadcrumbs aria-label="breadcrumb">
                <Typography component={Link} to="/" color="textSecondary" variant="h6" sx={{ textDecoration: 'none' }}>
                  Home
                </Typography>
                {mainContent}
                {itemContent}
              </MuiBreadcrumbs>
            </Grid>
            {title && (
              <Grid item sx={{ mt: 2 }}>
                <Typography variant="h5">{item.title}</Typography>
              </Grid>
            )}
          </Grid>
        </MainCard>
      );
    }
  }

  return breadcrumbContent;
};

export default Breadcrumbs;
