"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Upload,
  User as UserIcon,
  FileText,
  ExternalLink,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";

interface UserCV {
  _id: string;
  link: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { user, updateProfile, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullname, setFullname] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  // CV states
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [userCV, setUserCV] = useState<UserCV | null>(null);
  const [cvError, setCvError] = useState("");

  useEffect(() => {
    if (user) {
      setFullname(user.fullname || "");
      setImagePreview(user.image || null);
    }
  }, [user]);

  // Fetch user's CV
  useEffect(() => {
    fetchUserCV();
  }, []);

  const fetchUserCV = async () => {
    try {
      const response = await fetch("/api/cv");
      const data = await response.json();

      if (data.hasCV && data.cv) {
        setUserCV(data.cv);
      }
    } catch (error) {
      console.error("Error fetching CV:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setError("");
    setIsLoading(true);
    try {
      await updateProfile(fullname, imageFile || undefined);
      await refreshUser();
      setIsEditing(false);
      setImageFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFullname(user?.fullname || "");
    setImagePreview(user?.image || null);
    setImageFile(null);
    setError("");
  };

  const handleCVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setCvError("Please upload a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setCvError("File size must be less than 10MB");
        return;
      }
      setCvFile(file);
      setCvError("");
    }
  };

  const handleCVUpload = async () => {
    if (!cvFile) return;

    setIsUploadingCV(true);
    setCvError("");

    try {
      // Upload CV using the correct endpoint
      const formData = new FormData();
      formData.append("file", cvFile);

      const uploadResponse = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload CV");
      }

      const uploadData = await uploadResponse.json();
      console.log("CV uploaded successfully:", uploadData);

      // Refresh CV data
      await fetchUserCV();
      setCvFile(null);

      // Reset file input
      const fileInput = document.getElementById(
        "cv-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error uploading CV:", error);
      setCvError(
        error instanceof Error ? error.message : "Failed to upload CV"
      );
    } finally {
      setIsUploadingCV(false);
    }
  };

  const handleDeleteCV = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete your CV?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0c1b8a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch("/api/cv", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete CV");
      }

      setUserCV(null);
      setCvFile(null);

      Swal.fire({
        title: "Deleted!",
        text: "CV deleted successfully!",
        icon: "success",
        confirmButtonColor: "#0c1b8a",
      });
    } catch (error) {
      console.error("Error deleting CV:", error);
      Swal.fire({
        title: "Error!",
        text: error instanceof Error ? error.message : "Failed to delete CV",
        icon: "error",
        confirmButtonColor: "#0c1b8a",
      });
    }
  };

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="gap-2 mb-8">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <UserIcon className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            {isEditing && (
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="max-w-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: Square image, at least 400x400px
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CV Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Curriculum Vitae (CV)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userCV ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">CV Uploaded</p>
                      <p className="text-sm text-muted-foreground">
                        Last updated:{" "}
                        {new Date(userCV.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={userCV.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </a>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteCV}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your CV is used to auto-fill job matching and salary benchmark
                  forms.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cvError && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                    {cvError}
                  </div>
                )}
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium mb-2">Upload your CV</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    PDF format, max 10MB
                  </p>
                  <div className="flex flex-col items-center gap-3">
                    <Input
                      id="cv-upload"
                      type="file"
                      accept="application/pdf"
                      onChange={handleCVFileChange}
                      className="max-w-sm"
                    />
                    {cvFile && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {cvFile.name}
                        </span>
                      </div>
                    )}
                    <Button
                      onClick={handleCVUpload}
                      disabled={!cvFile || isUploadingCV}
                    >
                      {isUploadingCV ? "Uploading..." : "Upload CV"}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your CV will be used to automatically fill job matching and
                  salary benchmark forms.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="text-sm text-destructive bg-destructive/5 p-3 rounded">
            {error}
          </div>
        )}

        {isEditing && (
          <div className="flex gap-4 justify-center">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
