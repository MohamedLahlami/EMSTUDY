import React from 'react';
import PageLayout from '../../components/layout/PageLayout';
import DashboardSummary from '../../components/dashboard/DashboardSummary';

const DashboardPage: React.FC = () => {
  return (
    <PageLayout>
      <DashboardSummary />
    </PageLayout>
  );
};

export default DashboardPage;