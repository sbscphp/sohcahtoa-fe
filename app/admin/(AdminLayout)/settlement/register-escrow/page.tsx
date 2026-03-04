"use client";

import React, { useState } from "react";
import { 
  RegisterEscrowForm, 
  ConfirmationModal, 
  SuccessModal 
} from "./RegisterEscrowFlow";
import { useRouter } from "next/navigation";

export default function RegisterEscrowPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const router = useRouter();

  const handleFormSubmit = (data: any) => {
    setFormData(data);
    setConfirmOpen(true);
  };
  const handleConfirm = () => {
    setConfirmOpen(false);
    console.log("Submitting Data:", formData);
    

    setTimeout(() => {
      setSuccessOpen(true);
    }, 500);
  };

  const handleClose = () => {
    setSuccessOpen(false);
    
    router.push("/admin/settlement");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      
      {/* Form with the required onSubmit prop */}
      <RegisterEscrowForm onSubmit={handleFormSubmit} />

      {/* Confirmation Modal */}
      <ConfirmationModal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />

      {/* Success Modal */}
      <SuccessModal
        opened={successOpen}
        onClose={handleClose}
      />
    </div>
  );
}