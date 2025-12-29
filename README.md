# Craft Expenses Analyzer

A beautiful web app to analyze and visualize expenses synced from Craft docs via [Apple Shortcuts](https://key.craft.me/bt6E4leiMYLzaR).

Built for the **Craft Winter Challenge** 🎄

## Features

- 📊 **Interactive Charts** - Category breakdown, spending trends, monthly summaries, and merchant analysis
- 💰 **Budget Tracking** - Set monthly budgets per category with visual progress indicators
- 🌓 **Dark/Light Mode** - Seamless theme switching
- 📱 **Responsive Design** - Works great on desktop and mobile
- 🔄 **Real-time Sync** - Fetches latest data from Craft via API
- ⚙️ **In-App Configuration** - Users can input their own Craft API credentials directly in the UI
- 📊 **Mock Data Mode** - Try the app with sample data without API setup

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Source**: Craft Space API

## Getting Started

### Prerequisites

- Node.js 18+
- A Craft account with expense data
- Craft API token

### Installation

1. Clone the repository:

   ```bash
   cd expenses-analysis
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   # Create .env.local file
   echo "CRAFT_API_TOKEN=your_token_here" > .env.local
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
expenses-analysis/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard
│   ├── globals.css         # Global styles
│   └── api/
│       └── expenses/
│           └── route.ts    # Craft API integration
├── components/
│   ├── Dashboard.tsx       # Main container
│   ├── Header.tsx          # App header
│   ├── StatsCards.tsx      # Summary stats
│   ├── DateRangeFilter.tsx # Time period selector
│   ├── BudgetProgress.tsx  # Budget tracking
│   └── charts/
│       ├── CategoryPieChart.tsx
│       ├── SpendingTrendChart.tsx
│       ├── MonthlySummary.tsx
│       └── MerchantBar.tsx
├── lib/
│   ├── craft.ts            # Craft API client
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utilities
└── package.json
```

## Using Your Own Data

### Option 1: In-App Configuration (Recommended for Demo/Challenge)

1. Click the **Settings** icon (⚙️) in the header
2. Enter your Craft API credentials:
   - **API Base URL**: e.g., `https://connect.craft.do/links/YOUR_LINK_ID/api/v1`
   - **API Key**: Optional - required only when Access Mode is set to API Key
   - **Collection ID**: Your Receipts/Expenses collection ID (optional if auto-detect works)
3. Click **Save & Connect**

The app will immediately fetch and display your actual expense data!

### Option 2: Environment Variables (More Secure)

For production deployments or server-side configuration:

1. Update `lib/craft.ts` with your API details:

   ```typescript
   const CRAFT_API_BASE = 'https://connect.craft.do/links/YOUR_LINK_ID/api/v1'
   const COLLECTION_ID = 'YOUR-COLLECTION-ID-HERE'
   ```

2. Create `.env.local`:

   ```bash
   CRAFT_API_TOKEN=your_api_token_here
   ```

3. Restart the server:

   ```bash
   npm run dev
   ```

### Option 3: Use Mock Data

Just open the app! It comes with sample data pre-loaded, perfect for:

- Testing the features
- Demo purposes
- Craft Winter Challenge submissions

## Craft Integration

This app connects to the Craft Space API to fetch expense data from a "Receipts" collection. The collection schema includes:

- `merchant` - Store name
- `date` - Transaction date
- `category` - Expense category (e.g., 🛒 Groceries)
- `subtotal` - Amount before tax
- `tax` - Tax amount
- `total` - Total amount
- `payment_method` - Payment method used
- `summary` - Transaction description

## Workflow

1. **Capture Expense** - Use the Apple Shortcut to photograph a receipt or dictate expense details
2. **Sync to Craft** - The shortcut automatically creates an entry in the Receipts collection
3. **Configure** - Click Settings ⚙️ and enter your Craft API credentials (one-time setup)
4. **Analyze** - View real-time visualizations and track your spending

## How to Get Your Craft API Credentials

1. Open your Craft document containing the Receipts collection
2. Click the **Share** button (top right corner)
3. Enable "Link Sharing" if not already enabled
4. Click **Settings** (⚙️ icon) next to the shared link
5. Enable **API Access**
6. Copy the API URL and API Key if Access Mode requires it
7. Find your Collection ID from your collection block
8. Paste the credentials into the Settings modal in the app

📖 Learn more: [Craft API Documentation](https://support.craft.do/hc/en-us/articles/23702897811612-Craft-API)

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Connect repository to Vercel
3. Add `CRAFT_API_TOKEN` as environment variable
4. Deploy!

## License

MIT
