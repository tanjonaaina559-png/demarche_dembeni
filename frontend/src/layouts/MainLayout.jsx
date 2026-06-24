import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '68px' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
