"use client";

import AppSidebar from '@/components/AppSidebar'
import Navbar from '@/components/Navbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { useGetAuthUserQuery } from '@/state/api'
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { set } from 'zod';

const DashboardLayout = ({ children }:  { children: React.ReactNode }) => {

  const [userType, setUserType] = React.useState<"manager" | "tenant" | null>(null);
  const { data: authUser, isLoading } = useGetAuthUserQuery();

  const router = useRouter();
  const pathname = usePathname();


  useEffect(() => {
    if (authUser?.userRole) {
      setUserType(authUser.userRole.toLowerCase() as "manager" | "tenant");
    }

    if (
      (userType === "manager" && pathname.startsWith("tenants")) ||
      (userType === "tenant" && pathname.startsWith("managers"))
    ){
      router.push(
        userType === "manager" ? "/managers/properties" : "/tenants/favorites",
        {
          scroll: false,
        }
      );
    }
  }, [authUser])

  
  return (
    <>
      {isLoading && (
        <p>is Loading ... </p>
      )}
      {userType && <SidebarProvider>
        <div className='min-h-screen w-full bg-primary-100'>
          <Navbar/>
          <div
            style={{
              paddingTop: `${NAVBAR_HEIGHT}px`,
            }}
          >
            <main className="flex">
              <AppSidebar userType={userType} />
              <div className="flex-grow transition-all duration-300">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>}
    </>
  )
}

export default DashboardLayout