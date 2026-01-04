import { Button, FormField, Select, Alert, Text } from "@canva/app-ui-kit";
import { upload } from "@canva/asset";
import type { QueuedImage } from "@canva/asset";
import type { ImageDragConfig } from "@canva/design";
import { addElementAtPoint, ui } from "@canva/design";
import { useState, useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import * as styles from "styles/components.css";

export const App = () => {
  const intl = useIntl();
  // Set default platform and type
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedType, setSelectedType] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [preUploadedImage, setPreUploadedImage] = useState<QueuedImage | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTimeRef = useRef<number | null>(null);

  // Map each platform and type to a different image URL and size
  const platformTypeImages = {
    Instagram: {
      Post: {
        url: "https://i.ibb.co/CKw9qnkz/Instagram-Post.png",
        size: { width: 1080, height: 1350 },
      },
      Story: {
        url: "https://i.ibb.co/tTvywNK3/Instagram-Story.png",
        size: { width: 1080, height: 1920 },
      },
      Reel: {
        url: "https://i.ibb.co/7JNX8ShT/Instagram-Reel.png",
        size: { width: 1080, height: 1920 },
      },
    },
    X: {
      Post: {
        url: "https://i.ibb.co/FLK5sbmQ/Twitter-Post.png",
        size: { width: 1600, height: 900 },
      },
      Cover: {
        url: "https://i.ibb.co/nsM0YBKF/Twitter-Cover.png",
        size: { width: 1500, height: 500 },
      },
    },
    Linkedin: {
      Post: {
        url: "https://i.ibb.co/nqCyQ3bZ/Linked-In-Post.png",
        size: { width: 1200, height: 1200 },
      },
      Video: {
        url: "https://i.ibb.co/CsSbBTPQ/Linked-In-Reel.png",
        size: { width: 1080, height: 1920 },
      },
      Cover: {
        url: "https://i.ibb.co/vWkXjwX/Linked-In-Banner.png",
        size: { width: 1584, height: 396 },
      },
    },
  } as const;

  const platformOptions = [
    {
      value: "All",
      label: intl.formatMessage({
        defaultMessage: "All",
        description: "All platforms option",
      }),
    },
    {
      value: "Instagram",
      label: intl.formatMessage({
        defaultMessage: "Instagram",
        description: "Instagram option",
      }),
    },
    {
      value: "Linkedin",
      label: intl.formatMessage({
        defaultMessage: "LinkedIn",
        description: "LinkedIn option",
      }),
    },
    {
      value: "X",
      label: intl.formatMessage({
        defaultMessage: "X",
        description: "X option",
      }),
    },
  ];

  const handlePlatformChange = (value: string) => {
    setSelectedPlatform(value);
    setSelectedType(""); // Reset type when changing platform
    setShowPreview(false); // Reset preview when changing platform
  };

  const handleTypeSelect = (type: string) => {
    // Handle the case when "All" is selected and type includes platform prefix
    if (type.includes("-")) {
      const [platform, contentType] = type.split("-");
      setSelectedPlatform(platform);
      setSelectedType(contentType);
    } else {
      setSelectedType(type);
    }
    setShowPreview(true);
  };

  // Get available content types based on selected platform
  const getContentTypeOptions = () => {
    if (selectedPlatform === "All") {
      // When "All" is selected, show all content types from all platforms
      return Object.keys(platformTypeImages).flatMap((platform) =>
        Object.keys(platformTypeImages[platform]).map((type) => ({
          value: `${platform}-${type}`,
          label: intl.formatMessage(
            {
              defaultMessage: "{platform} {type}",
              description: "Platform and content type label",
            },
            { platform, type },
          ),
        })),
      );
    }
    return Object.keys(platformTypeImages[selectedPlatform]).map((type) => ({
      value: type,
      label: type,
    }));
  };

  // Get the current content type value for the Select
  const getContentTypeValue = () => {
    if (!selectedType) return "";
    if (selectedPlatform === "All") {
      // Find the option that matches our current selection
      const options = getContentTypeOptions();
      return (
        options.find((opt) => opt.value.endsWith(`-${selectedType}`))?.value ||
        ""
      );
    }
    return selectedType;
  };

  // Pre-upload image when preview is shown to reduce drag lag
  useEffect(() => {
    if (showPreview && selectedPlatform !== "All" && selectedType) {
      const { url, size } = platformTypeImages[selectedPlatform][selectedType];
      let cancelled = false;

      upload({
        type: "image",
        mimeType: "image/png",
        url,
        thumbnailUrl: url,
        aiDisclosure: "none",
        width: size.width,
        height: size.height,
      })
        .then((result) => {
          if (!cancelled && result?.ref) {
            setPreUploadedImage(result);
          }
        })
        .catch(() => {
          // Silently fail - will upload on demand
        });

      return () => {
        cancelled = true;
        setPreUploadedImage(null);
      };
    } else {
      setPreUploadedImage(null);
    }
  }, [showPreview, selectedPlatform, selectedType]);

  const handleAddToDesign = async () => {
    const { url, size } = platformTypeImages[selectedPlatform][selectedType];
    try {
      const result = await upload({
        type: "image",
        mimeType: "image/png",
        url,
        thumbnailUrl: url,
        aiDisclosure: "none",
        width: size.width,
        height: size.height,
      });

      if (!result || !result.ref) {
        throw new Error("Invalid upload result");
      }

      await addElementAtPoint({
        type: "image",
        ref: result.ref,
        altText: {
          text: `Uploaded ${selectedType} image for ${selectedPlatform}`,
          decorative: false,
        },
      });

      // Show success alert
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
    } catch {
      // Error handling - could show error alert in future
    }
  };

  const onDragStart = (event: React.DragEvent<HTMLElement>) => {
    const { url, size } = platformTypeImages[selectedPlatform][selectedType];

    setIsDragging(true);

    // Record drag start time for success message
    const dragStartTime = Date.now();
    dragStartTimeRef.current = dragStartTime;

    const dragData: ImageDragConfig = {
      type: "image",
      resolveImageRef: async () => {
        // Use pre-uploaded image if available, otherwise upload on demand
        if (preUploadedImage) {
          return preUploadedImage;
        }
        return upload({
          type: "image",
          mimeType: "image/png",
          url,
          thumbnailUrl: url,
          aiDisclosure: "none",
          width: size.width,
          height: size.height,
        });
      },
      previewUrl: url,
      previewSize: { width: size.width, height: size.height },
      fullSize: { width: size.width, height: size.height },
    };

    if (ui.startDragToPoint) {
      ui.startDragToPoint(event, dragData);
    } else if (ui.startDragToCursor) {
      ui.startDragToCursor(event, dragData);
    }

    // Show success message after a delay (to account for drop completion)
    // This is a workaround since Canva SDK doesn't provide drag completion callback
    // Using a longer delay to ensure the drop has completed
    setTimeout(() => {
      // Only show if drag was recent (within last 5 seconds) to avoid false positives
      if (dragStartTimeRef.current === dragStartTime) {
        setShowSuccessAlert(true);
        setTimeout(() => {
          setShowSuccessAlert(false);
        }, 3000);
        dragStartTimeRef.current = null;
      }
    }, 2000);
  };

  return (
    <div className={styles.scrollContainer} style={{ padding: 16 }}>
      {showSuccessAlert && (
        <Alert tone="positive" onDismiss={() => setShowSuccessAlert(false)}>
          {intl.formatMessage({
            defaultMessage: "Image added to design successfully.",
            description: "Success message when image is added",
          })}
        </Alert>
      )}

      <Text size="medium" alignment="start" tone="secondary">
        {intl.formatMessage({
          defaultMessage:
            "Select a content type to preview its safe zone, then add it to your design to use as guide",
          description: "Instructional text for users",
        })}
      </Text>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginTop: 16,
        }}
      >
        <FormField
          label={intl.formatMessage({
            defaultMessage: "Platform",
            description: "Platform form field label",
          })}
          control={(props) => (
            <Select<string>
              {...props}
              stretch
              value={selectedPlatform}
              onChange={handlePlatformChange}
              options={platformOptions}
            />
          )}
        />

        <FormField
          label={intl.formatMessage({
            defaultMessage: "Content type",
            description: "Content type form field label",
          })}
          control={(props) => (
            <Select<string>
              {...props}
              stretch
              value={getContentTypeValue()}
              onChange={handleTypeSelect}
              options={getContentTypeOptions()}
              placeholder={intl.formatMessage({
                defaultMessage: "Select",
                description: "Content type select placeholder",
              })}
            />
          )}
        />

        {showPreview && selectedPlatform !== "All" && selectedType && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FormField
              label={intl.formatMessage({
                defaultMessage: "Safe zone preview",
                description: "Safe zone preview label",
              })}
              control={(props) => (
                <div {...props} style={{ height: 0, overflow: "hidden" }} />
              )}
            />
            <div
              draggable={true}
              style={{
                width: "100%",
                height: 200,
                borderRadius: 8,
                backgroundColor: "var(--ui-kit-color-ui-neutral-subtle-bg)",
                backgroundImage: `url(${platformTypeImages[selectedPlatform][selectedType].url})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                cursor: isDragging ? "grabbing" : "grab",
                position: "relative",
                userSelect: "none",
                opacity: isDragging ? 0.8 : 1,
                transition: "opacity 0.2s",
              }}
              onClick={handleAddToDesign}
              onDragStart={onDragStart}
              onDragEnd={() => {
                setIsDragging(false);
                // Don't reset dragStartTimeRef here - let the timeout handle success message
              }}
              role="img"
              aria-label={intl.formatMessage(
                {
                  defaultMessage: "{platform} {type} preview",
                  description: "Preview image alt text",
                },
                { platform: selectedPlatform, type: selectedType },
              )}
            />
            <Button variant="primary" onClick={handleAddToDesign}>
              {intl.formatMessage({
                defaultMessage: "Add to design",
                description: "Add to design button label",
              })}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
