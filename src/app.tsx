import { Button, FormField, Select, Alert, Text } from "@canva/app-ui-kit";
import { upload } from "@canva/asset";
import type { QueuedImage } from "@canva/asset";
import type { ImageDragConfig } from "@canva/design";
import { addElementAtPoint, ui } from "@canva/design";
import { useState, useEffect, useRef } from "react";
import { FormattedMessage, useIntl } from "react-intl";
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
        url: "https://static.wixstatic.com/media/19f976_8ed0f00803144be19ad9c797c0809a93~mv2.png",
        size: { width: 1080, height: 1350 },
      },
      Story: {
        url: "https://static.wixstatic.com/media/19f976_5af072b70e52475d9222cde00f469506~mv2.png",
        size: { width: 1080, height: 1920 },
      },
      Reel: {
        url: "https://static.wixstatic.com/media/19f976_1c9269c42bb44e5c8727f46ce547b05c~mv2.png",
        size: { width: 1080, height: 1920 },
      },
    },
    X: {
      Post: {
        url: "https://static.wixstatic.com/media/19f976_74005f325a8a459a927b59b7706f403e~mv2.png",
        size: { width: 1600, height: 900 },
      },
      Cover: {
        url: "https://static.wixstatic.com/media/19f976_a48bfef383c04e57bae6f1df092de916~mv2.png",

        size: { width: 1500, height: 500 },
      },
    },
    Linkedin: {
      Post: {
        url: "https://static.wixstatic.com/media/19f976_c7db69fbcbde47dfabf9d942b50881a7~mv2.png",
        size: { width: 1200, height: 1200 },
      },
      Video: {
        url: "https://static.wixstatic.com/media/19f976_34b97b8bfd3346cdabe7f70fded47c8b~mv2.png",
        size: { width: 1080, height: 1920 },
      },
      Cover: {
        url: "https://static.wixstatic.com/media/19f976_f8573a11b1104845a6454776cb5a5334~mv2.png",
        size: { width: 1584, height: 396 },
      },
    },
  } as const;

  const platformOptions = [
    {
      value: "All",
      label: intl.formatMessage({
        defaultMessage: "All",
        description:
          "Option in platform dropdown to show all available platforms. Appears in the Platform select dropdown menu.",
      }),
    },
    {
      value: "Instagram",
      label: intl.formatMessage({
        defaultMessage: "Instagram",
        description:
          "Instagram platform option in the Platform dropdown. Appears as a selectable option in the Platform select menu.",
      }),
    },
    {
      value: "Linkedin",
      label: intl.formatMessage({
        defaultMessage: "LinkedIn",
        description:
          "LinkedIn platform option in the Platform dropdown. Appears as a selectable option in the Platform select menu.",
      }),
    },
    {
      value: "X",
      label: intl.formatMessage({
        defaultMessage: "X",
        description:
          "X (formerly Twitter) platform option in the Platform dropdown. Appears as a selectable option in the Platform select menu.",
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

  // Get translated content type label
  const getContentTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      Post: intl.formatMessage({
        defaultMessage: "Post",
        description:
          "Content type option 'Post' in the Content type dropdown. Shown when a specific platform is selected. Represents a standard social media post.",
      }),
      Story: intl.formatMessage({
        defaultMessage: "Story",
        description:
          "Content type option 'Story' in the Content type dropdown. Shown when a specific platform is selected. Represents a social media story format.",
      }),
      Reel: intl.formatMessage({
        defaultMessage: "Reel",
        description:
          "Content type option 'Reel' in the Content type dropdown. Shown when a specific platform is selected. Represents a short-form video reel format.",
      }),
      Video: intl.formatMessage({
        defaultMessage: "Video",
        description:
          "Content type option 'Video' in the Content type dropdown. Shown when a specific platform is selected. Represents a video content format.",
      }),
      Cover: intl.formatMessage({
        defaultMessage: "Cover",
        description:
          "Content type option 'Cover' in the Content type dropdown. Shown when a specific platform is selected. Represents a cover image or banner format.",
      }),
    };
    return typeLabels[type] || type;
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
              description:
                "Combined platform and content type label shown in Content type dropdown when 'All' is selected in Platform dropdown. Format: 'PlatformName ContentTypeName' (e.g., 'Instagram Post', 'LinkedIn Video'). {platform} is the name of the social media platform (Instagram, LinkedIn, or X). {type} is the translated content type (Post, Story, Reel, Video, or Cover).",
            },
            { platform, type: getContentTypeLabel(type) },
          ),
        })),
      );
    }
    return Object.keys(platformTypeImages[selectedPlatform]).map((type) => ({
      value: type,
      label: getContentTypeLabel(type),
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
        // Use error code instead of translated string from API
        throw new Error("UPLOAD_FAILED");
      }

      await addElementAtPoint({
        type: "image",
        ref: result.ref,
        altText: {
          text: intl.formatMessage(
            {
              defaultMessage: "Uploaded {type} image for {platform}",
              description:
                "Accessibility text describing the uploaded image. Used by screen readers. Format: 'Uploaded [ContentType] image for [PlatformName]' (e.g., 'Uploaded Post image for Instagram'). {type} is the content type (Post, Story, Reel, Video, or Cover). {platform} is the platform name (Instagram, LinkedIn, or X).",
            },
            { type: selectedType, platform: selectedPlatform },
          ),
          decorative: false,
        },
      });

      // Show success alert
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
    } catch (error) {
      // Error handling - use status codes/identifiers instead of API error messages
      // In future, could show localized error alert based on error code
      const _errorCode =
        error instanceof Error ? error.message : "UNKNOWN_ERROR";
      // Error code stored for future error handling - _errorCode is a status identifier, not user-facing text
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
          <FormattedMessage
            defaultMessage="Image added to design successfully."
            description="Success notification message displayed at the top of the app when an image is successfully added to the design canvas. Appears after clicking 'Add to design' button or completing drag and drop. Auto-dismisses after 3 seconds."
          />
        </Alert>
      )}

      <div style={{ marginTop: 24 }}>
        <Text size="medium" alignment="start" tone="secondary">
          <FormattedMessage
            defaultMessage="Select a content type to preview its safe zone, then add it to your design to use as guide"
            description="Instructional text displayed at the top of the app interface. Guides users on how to use the app: first select a content type to see its safe zone preview, then add it to their design. Appears below the success alert (if shown) or at the very top of the main content area."
          />
        </Text>
      </div>

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
            description:
              "Label for the Platform dropdown field. Appears above the Platform select dropdown. Users select a social media platform (Instagram, LinkedIn, X, or All) to filter available content types.",
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
            description:
              "Label for the Content type dropdown field. Appears above the Content type select dropdown. Users select a content type (Post, Story, Reel, Video, or Cover) to preview its safe zone.",
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
                description:
                  "Placeholder text shown in the Content type dropdown when no option is selected. Appears in gray text inside the select field. Prompt users to choose a content type.",
              })}
            />
          )}
        />

        {showPreview && selectedPlatform !== "All" && selectedType && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FormField
              label={intl.formatMessage({
                defaultMessage: "Safe zone preview",
                description:
                  "Label for the safe zone preview section. Appears above the preview area showing the safe zone visualization. Displayed when a content type is selected.",
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
                  description:
                    "Accessibility label for the safe zone preview image. Used by screen readers to describe the preview area. Format: '[PlatformName] [ContentType] preview' (e.g., 'Instagram Post preview'). {platform} is the name of the social media platform (Instagram, LinkedIn, or X). {type} is the content type (Post, Story, Reel, Video, or Cover).",
                },
                { platform: selectedPlatform, type: selectedType },
              )}
            />
            <Button variant="primary" onClick={handleAddToDesign}>
              {intl.formatMessage({
                defaultMessage: "Add to design",
                description:
                  "Primary button label to add the selected safe zone image to the design canvas. Appears below the safe zone preview. Users click this button or drag the preview image to add it to their design.",
              })}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
