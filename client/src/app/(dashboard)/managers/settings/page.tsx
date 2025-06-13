"use client";
import SettingsForm from '@/components/SettingsForm';
import { useGetAuthUserQuery, useUpdateManagerMutation } from '@/state/api';
import React from 'react'

const ManagerSettings = () => {
  const { data: authUser, isLoading } = useGetAuthUserQuery();

  const [ updateManager ] = useUpdateManagerMutation();
  // im checking something over here

  console.log("hello");
  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!authUser) {
    return <p>No user data found.</p>;
  }

  
  const initialData = {
    name: authUser?.userInfo.name || '',
    email: authUser?.userInfo.email || '',
    phoneNumber: authUser?.userInfo.phoneNumber || '',
  };

  const handleSubmit = async (data: typeof initialData) => {
    try {
      await updateManager({
        cognitoId: authUser?.userInfo.cognitoId,
        ...data,
      })
      console.log("Form submitted successfully");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  
  return (
    <SettingsForm
      initialData={initialData}
      onSubmit={handleSubmit}
      userType="manager"
    />
  )
}

export default ManagerSettings