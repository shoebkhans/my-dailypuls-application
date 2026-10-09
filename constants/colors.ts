/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#19352f',
    tint: '#da725e',
    background: '#f5f3ed',
    foreground: '#19352f',
    card: '#fffefa',
    cardForeground: '#19352f',
    primary: '#d96f59',
    primaryForeground: '#fffefa',
    secondary: '#e7eee7',
    secondaryForeground: '#31584d',
    muted: '#eeece5',
    mutedForeground: '#75827a',
    accent: '#e2eee7',
    accentForeground: '#31584d',
    destructive: '#bd554c',
    destructiveForeground: '#ffffff',
    border: '#e5e2d9',
    input: '#e5e2d9',
    success: '#5c8870',
    warm: '#f4e3ce',
  },
  dark: {
    text: '#edf1e9',
    tint: '#ed9478',
    background: '#172520',
    foreground: '#edf1e9',
    card: '#21332c',
    cardForeground: '#edf1e9',
    primary: '#e28a70',
    primaryForeground: '#1b2822',
    secondary: '#2d4037',
    secondaryForeground: '#d5e2d8',
    muted: '#2a3932',
    mutedForeground: '#a4b2a8',
    accent: '#30463b',
    accentForeground: '#d8e8dc',
    destructive: '#d56f64',
    destructiveForeground: '#fff7f4',
    border: '#35473e',
    input: '#3a4d43',
    success: '#83b091',
    warm: '#4a3a2d',
  },
  radius: 22,
};

export default colors;
