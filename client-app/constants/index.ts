import { colors } from '@/theme';

/** @deprecated Import `colors` from `@/theme` in new UI. */
export const COLORS = {
    primary: colors.primary,
    secondary: colors.textSecondary,
    background: colors.background,
    surface: colors.surfaceSoft,
    accent: colors.nimbus500,
    border: colors.border,
    error: colors.error,
};

export const CATEGORIES = [
    { id: 1, name: "Home", icon: "home-outline" },
    { id: 2, name: "Clothing", icon: "shirt-outline" },
    { id: 3, name: "Jewelry", icon: "diamond-outline" },
    { id: 4, name: "Art", icon: "color-palette-outline" },
    { id: 5, name: "Accessories", icon: "bag-handle-outline" },
    { id: 6, name: "Vintage", icon: "time-outline" },
];

export const PROFILE_MENU = [
    { id: 1, title: "My Orders", icon: "receipt-outline", route: "/orders" },
    { id: 2, title: "Shipping Addresses", icon: "location-outline", route: "/addresses" },
    { id: 4, title: "My Reviews", icon: "star-outline", route: "/" },
    { id: 5, title: "Settings", icon: "settings-outline", route: "/" },
];

export const getStatusColor = (status: string) => {
    switch (status) {
        case "placed":
            return "bg-surface text-secondary";
        case "processing":
            return "bg-nimbus-blue text-primary";
        case "shipped":
            return "bg-nimbus-blue text-primary";
        case "delivered":
            return "bg-green-50 text-green-900";
        case "cancelled":
            return "bg-red-50 text-red-900";
        default:
            return "bg-surface text-secondary";
    }
};
