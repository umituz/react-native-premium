/**
 * Premium Info Card Component
 * Displays premium subscription details in Settings screen
 *
 * Generic component that can be used across all apps.
 * All information is passed via props for maximum flexibility.
 *
 * Shows:
 * - Premium active status with optional badge
 * - Plan type (Monthly/Yearly)
 * - Expiration date
 * - Purchase date
 * - Manage subscription link (only for non-premium users)
 *
 * For non-premium users, shows upgrade card
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  useAppDesignTokens,
  AtomicText,
  AtomicIcon,
  AtomicCard,
} from "@umituz/react-native-design-system";
import { useLocalization } from "@umituz/react-native-localization";
import { formatExpirationDate } from "@umituz/react-native-subscription";

export interface PremiumInfoCardProps {
  /** Whether user has active premium subscription */
  isPremium: boolean;

  /** Product ID (e.g., "com.app.premium.monthly") */
  productId?: string | null;

  /** Expiration date (ISO string) */
  expiresAt?: string | null;

  /** Purchase date (ISO string) */
  purchasedAt?: string | null;

  /** Callback when card is pressed (optional for premium users) */
  onPress?: () => void;

  /** Optional premium badge component to display */
  premiumBadge?: React.ReactNode;

  /** Optional custom upgrade title (defaults to translation key) */
  upgradeTitle?: string;

  /** Optional custom upgrade subtitle (defaults to translation key) */
  upgradeSubtitle?: string;

  /** Optional custom premium active title (defaults to translation key) */
  premiumActiveTitle?: string;

  /** Optional custom plan label (defaults to translation key) */
  planLabel?: string;

  /** Optional custom renews on label (defaults to translation key) */
  renewsOnLabel?: string;

  /** Optional custom purchased on label (defaults to translation key) */
  purchasedOnLabel?: string;

  /** Optional custom manage subscription label (defaults to translation key) */
  manageSubscriptionLabel?: string;
}

export const PremiumInfoCard: React.FC<PremiumInfoCardProps> = ({
  isPremium,
  productId,
  expiresAt,
  purchasedAt,
  onPress,
  premiumBadge,
  upgradeTitle,
  upgradeSubtitle,
  premiumActiveTitle,
  planLabel,
  renewsOnLabel,
  purchasedOnLabel,
  manageSubscriptionLabel,
}) => {
  const tokens = useAppDesignTokens();
  const { t, currentLanguage } = useLocalization();

  // Determine plan type from product ID
  const planType =
    productId?.includes("yearly") || productId?.includes("annual")
      ? t("subscription.plans.yearly")
      : productId?.includes("monthly")
        ? t("subscription.plans.monthly")
        : t("subscription.premium");

  // Format dates
  const expiresAtFormatted = expiresAt
    ? formatExpirationDate(expiresAt, currentLanguage)
    : null;
  const purchasedAtFormatted = purchasedAt
    ? new Date(purchasedAt).toLocaleDateString(currentLanguage, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Use custom labels or fallback to translation keys
  const upgradeTitleText =
    upgradeTitle || t("subscription.upgradeTitle", "Upgrade to Premium");
  const upgradeSubtitleText =
    upgradeSubtitle ||
    t(
      "subscription.upgradeSubtitle",
      "Unlock unlimited features and advanced capabilities",
    );
  const premiumActiveTitleText =
    premiumActiveTitle ||
    t("subscription.premiumActiveTitle", "You're Premium!");
  const planLabelText =
    planLabel || t("subscription.plan", "Plan");
  const renewsOnLabelText =
    renewsOnLabel || t("subscription.renewsOn", "Renews on");
  const purchasedOnLabelText =
    purchasedOnLabel || t("subscription.purchasedOn", "Purchased on");
  const manageSubscriptionLabelText =
    manageSubscriptionLabel ||
    t("subscription.premiumActiveManage", "Manage Subscription");

  if (!isPremium) {
    // Not premium - show upgrade card
    // onPress is required for non-premium users
    if (!onPress) {
      throw new Error("onPress is required for non-premium users");
    }
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <AtomicCard
          style={[
            styles.card,
            {
              backgroundColor: tokens.colors.surfaceVariant,
              borderColor: tokens.colors.primary,
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <AtomicIcon name="Crown" customSize={32} customColor={tokens.colors.primary} />
          </View>
          <View style={styles.content}>
            <AtomicText type="titleMedium" color="onSurface">
              {upgradeTitleText}
            </AtomicText>
            <AtomicText
              type="bodyMedium"
              color="textSecondary"
              style={styles.description}
            >
              {upgradeSubtitleText}
            </AtomicText>
          </View>
          <AtomicIcon
            name="ChevronRight"
            customSize={20}
            customColor={tokens.colors.textSecondary}
          />
        </AtomicCard>
      </TouchableOpacity>
    );
  }

  // Premium active - show details
  // Note: Premium users should NOT see "Manage Subscription" link
  // They manage subscriptions through device settings, not in-app
  // onPress is optional for premium users (can be undefined)
  return (
    <TouchableOpacity onPress={onPress || (() => {})} activeOpacity={0.8}>
      <AtomicCard
        style={[
          styles.card,
          {
            backgroundColor: tokens.colors.primaryContainer,
            borderColor: tokens.colors.primary,
            borderWidth: 1,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <AtomicIcon name="Crown" customSize={32} customColor={tokens.colors.primary} />
          </View>
          {premiumBadge}
        </View>

        <View style={styles.content}>
          <AtomicText type="titleMedium" color="onSurface" style={styles.title}>
            {premiumActiveTitleText}
          </AtomicText>

          {/* Plan Type */}
          <View style={styles.infoRow}>
            <AtomicIcon
              name="Package"
              customSize={16}
              customColor={tokens.colors.textSecondary}
            />
            <AtomicText
              type="bodyMedium"
              color="textSecondary"
              style={styles.infoText}
            >
              {planLabelText}: {planType}
            </AtomicText>
          </View>

          {/* Expires At */}
          {expiresAtFormatted && (
            <View style={styles.infoRow}>
              <AtomicIcon
                name="Calendar"
                customSize={16}
                customColor={tokens.colors.textSecondary}
              />
              <AtomicText
                type="bodyMedium"
                color="textSecondary"
                style={styles.infoText}
              >
                {renewsOnLabelText}: {expiresAtFormatted}
              </AtomicText>
            </View>
          )}

          {/* Purchased At */}
          {purchasedAtFormatted && (
            <View style={styles.infoRow}>
              <AtomicIcon
                name="CheckCircle"
                customSize={16}
                customColor={tokens.colors.textSecondary}
              />
              <AtomicText
                type="bodyMedium"
                color="textSecondary"
                style={styles.infoText}
              >
                {purchasedOnLabelText}: {purchasedAtFormatted}
              </AtomicText>
            </View>
          )}

          {/* Manage Subscription - ONLY for non-premium users */}
          {/* Premium users manage subscriptions through device settings, not in-app */}
        </View>
      </AtomicCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 12,
  },
  description: {
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
  },
  manageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  manageText: {
    fontWeight: "600",
  },
});

