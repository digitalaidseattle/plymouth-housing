
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('should render without crashing', () => {
    const navigation = {
      items: [
        {
          id: 'group-dashboard',
          title: 'Dashboard',
          type: 'group',
          children: [
            {
              id: 'dashboard',
              title: 'Dashboard',
              type: 'item',
              url: '/dashboard/default',
              icon: () => null,
              breadcrumbs: false,
            },
          ],
        },
      ],
    };

    render(
      <MemoryRouter>
        <Breadcrumbs navigation={navigation} title={true} />
      </MemoryRouter>
    );
  });
});
