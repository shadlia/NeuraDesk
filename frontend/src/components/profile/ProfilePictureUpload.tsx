import { useState, useRef } from "react";
import { Camera, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface ProfilePictureUploadProps {
  currentAvatarUrl: string | null;
  userInitials: string;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
  isUploading?: boolean;
}

export const ProfilePictureUpload = ({
  currentAvatarUrl,
  userInitials,
  onUpload,
  onDelete,
  isUploading = false,
}: ProfilePictureUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      await onUpload(file);
    } catch (error) {
      // Reset preview on error
      setPreview(currentAvatarUrl);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete();
      setPreview(null);
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`relative group ${isDragging ? 'ring-2 ring-accent' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
          <AvatarImage src={preview || undefined} alt="Profile picture" />
          <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-accent/20 to-accent/10">
            {userInitials}
          </AvatarFallback>
        </Avatar>

        {/* Overlay on hover */}
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Camera className="h-6 w-6" />
          </Button>
        </div>

        {/* Upload indicator */}
        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Photo
        </Button>

        {preview && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isUploading}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground text-center">
        Drag and drop or click to upload
        <br />
        JPG, PNG or WebP (max 2MB)
      </p>
    </div>
  );
};
