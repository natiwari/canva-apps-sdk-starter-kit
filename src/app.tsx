import { Button, ImageCard, Checkbox } from "@canva/app-ui-kit";
import { upload } from "@canva/asset";
import type { ImageDragConfig } from "@canva/design";
import { addElementAtPoint, ui } from "@canva/design";
import { useRef, useState } from "react";
import { useIntl } from "react-intl";
import * as styles from "styles/components.css";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export const App = () => {
  const intl = useIntl();
  // Set default platform and type
  const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
  const [selectedType, setSelectedType] = useState("Post");
  const [showPreview, setShowPreview] = useState(true);

  // Map each platform and type to a different image URL and size
  const platformTypeImages = {
    Instagram: {
      Post: {
        url: "https://i.ibb.co/xKB5QFKH/Instagram-Post.png",
        size: { width: 1080, height: 1350 },
      },
      Story: {
        url: "https://i.ibb.co/rGDS6cBZ/Instagram-Story.png",
        size: { width: 1080, height: 1920 },
      },
      Reel: {
        url: "https://i.ibb.co/jPLgHhW0/Instagram-Reel.png",
        size: { width: 1080, height: 1920 },
      },
    },
    Twitter: {
      Post: {
        url: "https://i.ibb.co/PsdFrzVB/Twitter-Post.png",
        size: { width: 1600, height: 900 },
      },
      Cover: {
        url: "https://i.ibb.co/wj0R63R/Twitter-Cover.png",
        size: { width: 1500, height: 500 },
      },
    },
    Linkedin: {
      Post: {
        url: "https://i.ibb.co/1B6GwL1/Linked-In-Post.png",
        size: { width: 1200, height: 627 },
      },
      Video: {
        url: "https://i.ibb.co/jPLgHhW0/Instagram-Reel.png",
        size: { width: 1920, height: 1080 },
      },
      Cover: {
        url: "https://i.ibb.co/WNvY8VFm/Linked-In-Banner.png",
        size: { width: 1584, height: 396 },
      },
    },
  } as const;

  const platformTabs: { value: string; label: string; icon?: JSX.Element }[] = [
    { value: "All", label: intl.formatMessage({ defaultMessage: "All", description: "All platforms tab" }) },
    { value: "Instagram", label: intl.formatMessage({ defaultMessage: "Instagram", description: "Instagram tab" }), icon: <FaInstagram style={{ color: "#E4405F", fontSize: 22 }} /> },
    { value: "Linkedin", label: intl.formatMessage({ defaultMessage: "LinkedIn", description: "LinkedIn tab" }), icon: <FaLinkedin style={{ color: "#1877F2", fontSize: 22 }} /> },
    { value: "Twitter", label: intl.formatMessage({ defaultMessage: "X", description: "X tab" }), icon: <FaXTwitter style={{ color: "#1DA1F2", fontSize: 22 }} /> },
  ];

  const handlePlatformChange = (value) => {
    setSelectedPlatform(value);
    setSelectedType(""); // Reset type when changing platform
    setShowPreview(false); // Reset preview when changing platform
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setShowPreview(true);
  };

  // Horizontal scroll controls for platform tabs
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollTabsBy = (delta: number) => {
    const el = tabsContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };
  const onScrollRightClick = () => scrollTabsBy(160);
  const onScrollLeftClick = () => scrollTabsBy(-160);
  const onScrollButtonKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    dir: "left" | "right",
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      dir === "left" ? onScrollLeftClick() : onScrollRightClick();
    }
  };

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
    } catch (error) {
      console.error("Error adding image:", error);
    }
  };

  const onDragStart = (event: React.DragEvent<HTMLElement>) => {
    const { url, size } = platformTypeImages[selectedPlatform][selectedType];
    const dragData: ImageDragConfig = {
      type: "image",
      resolveImageRef: () =>
        upload({
          type: "image",
          mimeType: "image/png",
          url,
          thumbnailUrl: url,
          aiDisclosure: "none",
          width: size.width,
          height: size.height,
        }),
      previewUrl: url,
      previewSize: { width: size.width, height: size.height },
      fullSize: { width: size.width, height: size.height },
    };
    if (ui.startDragToPoint) {
      ui.startDragToPoint(event, dragData);
    } else if (ui.startDragToCursor) {
      ui.startDragToCursor(event, dragData);
    }
  };

  return (
    <div className={styles.scrollContainer}>
      <div className={styles.scrollContainer} style={{ marginLeft: -50 }}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              margin: 0,
              paddingBottom: 8,
              overflowX: "auto",
              whiteSpace: "nowrap",
              paddingRight: 28,
            }}
            ref={tabsContainerRef}
            aria-label={intl.formatMessage({ defaultMessage: "Social media platforms", description: "Tablist label" })}
          >
            {platformTabs.map((tab) => {
              const isActive = selectedPlatform === tab.value;
              return (
                <span key={tab.value} style={{ display: "inline-block" }}>
                  <Button
                    variant={isActive ? "contrast" : "secondary"}
                    onClick={() => handlePlatformChange(tab.value)}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      {tab.icon}
                      {tab.label}
                    </span>
                  </Button>
                </span>
              );
            })}
          </div>
          <div
            aria-hidden
            style={{
              position: "absolute",
              right: 2,
              top: 0,
              bottom: 8,
              width: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.06))",
              borderRadius: 6,
            }}
          >
            <span style={{ fontSize: 20, opacity: 0.6 }}>›</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 12,
          }}
        >
          {(selectedPlatform === "All"
            ? Object.keys(platformTypeImages).flatMap((platform) =>
                Object.keys(platformTypeImages[platform]).map((type) => ({
                  platform,
                  type,
                })),
              )
            : Object.keys(platformTypeImages[selectedPlatform]).map((type) => ({
                platform: selectedPlatform,
                type,
              }))
          ).map(({ platform, type }) => {
            const meta = platformTypeImages[platform][type];
            const isActive =
              selectedPlatform === platform && selectedType === type;
            return (
              <div
                key={`${platform}-${type}`}
                onClick={() => {
                  setSelectedPlatform(platform);
                  handleTypeSelect(type);
                }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  cursor: "pointer",
                  padding: "8px 6px",
                  borderRadius: 8,
                  outline: isActive
                    ? "2px solid var(--ui-kit-color-typography-secondary)"
                    : "none",
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedPlatform(platform);
                    handleTypeSelect(type);
                  }
                }}
              >
                <Checkbox
                  label={`${platform} ${type}`}
                  description={intl.formatMessage(
                    { defaultMessage: "{w} × {h} px", description: "Dimensions label" },
                    { w: meta.size.width, h: meta.size.height },
                  )}
                  checked={isActive}
                  onChange={() => {
                    setSelectedPlatform(platform);
                    handleTypeSelect(type);
                  }}
                />
              </div>
            );
          })}
        </div>

        {showPreview && selectedPlatform && selectedType && (
          <div className={styles.previewContainer}>
            <div
              style={{
                borderRadius: 12,
                padding: 8,
                boxShadow:
                  "0 0 0 1px var(--ui-kit-color-typography-quaternary)",
              }}
            >
              <ImageCard
                ariaLabel="Add image to design"
                alt={`${selectedPlatform} ${selectedType} preview`}
                thumbnailUrl={
                  platformTypeImages[selectedPlatform][selectedType].url
                }
                onDragStart={onDragStart}
                onClick={handleAddToDesign}
              />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
              {platformTypeImages[selectedPlatform][selectedType].size.width} ×{" "}
              {platformTypeImages[selectedPlatform][selectedType].size.height}{" "}
              px
            </div>
            <Button variant="secondary" onClick={handleAddToDesign}>
              Add to Design
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
