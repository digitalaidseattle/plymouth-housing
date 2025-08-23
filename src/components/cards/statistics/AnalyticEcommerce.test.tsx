
import { render, screen } from '@testing-library/react';
import AnalyticEcommerce from './AnalyticEcommerce';

describe('AnalyticEcommerce', () => {
  it('should render the title, count, percentage, and extra value correctly', () => {
    render(
      <AnalyticEcommerce
        title="Test Title"
        count="100"
        percentage={10}
        extra="$1000"
      />
    );
    expect(screen.getByText('Test Title')).not.toBeNull();
    expect(screen.getByText('100')).not.toBeNull();
    expect(screen.getByText('10%')).not.toBeNull();
    expect(screen.getByText('$1000')).not.toBeNull();
  });

  it('should render the RiseOutlined icon when isLoss is false', () => {
    const { container } = render(
      <AnalyticEcommerce
        title="Test Title"
        count="100"
        percentage={10}
        isLoss={false}
        extra="$1000"
      />
    );
    const riseIcon = container.querySelector('.anticon-rise');
    expect(riseIcon).not.toBeNull();
  });

  it('should render the FallOutlined icon when isLoss is true', () => {
    const { container } = render(
      <AnalyticEcommerce
        title="Test Title"
        count="100"
        percentage={10}
        isLoss={true}
        extra="$1000"
      />
    );
    const fallIcon = container.querySelector('.anticon-fall');
    expect(fallIcon).not.toBeNull();
  });

  it('should not render the percentage chip if percentage is not provided', () => {
    render(
      <AnalyticEcommerce title="Test Title" count="100" extra="$1000" percentage={0} />
    );
    expect(screen.queryByText('%')).toBeNull();
  });
});
