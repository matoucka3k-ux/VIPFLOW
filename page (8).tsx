@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 220 14% 10%;
    --card: 0 0% 100%;
    --card-foreground: 220 14% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 220 14% 10%;
    --primary: 153 60% 32%;
    --primary-foreground: 0 0% 100%;
    --secondary: 150 10% 95%;
    --secondary-foreground: 220 14% 10%;
    --muted: 150 10% 96%;
    --muted-foreground: 220 5% 46%;
    --accent: 42 100% 50%;
    --accent-foreground: 220 14% 10%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 150 10% 90%;
    --input: 150 10% 90%;
    --ring: 153 60% 32%;
    --radius: 0.625rem;
    --sidebar: 220 14% 6%;
    --sidebar-foreground: 150 10% 85%;
  }
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}

.blur-content {
  filter: blur(6px);
  user-select: none;
  pointer-events: none;
}
