#!/bin/bash

# KarirKit Deployment Helper Script

echo "🚀 KarirKit Deployment Helper"
echo "================================"
echo ""

# Check if in my-app directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the my-app directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI is installed"
echo ""

# Menu
echo "Choose deployment option:"
echo "1. First time deployment (interactive)"
echo "2. Deploy to production"
echo "3. Deploy preview (branch deployment)"
echo "4. View logs"
echo "5. Open Vercel dashboard"
echo "6. Check deployment status"
echo ""
read -p "Enter option (1-6): " option

case $option in
    1)
        echo ""
        echo "🎯 Starting first-time deployment..."
        echo ""
        echo "⚠️  Important reminders:"
        echo "   1. Make sure all environment variables are ready"
        echo "   2. Root directory should be 'my-app'"
        echo "   3. Framework preset: Next.js"
        echo ""
        read -p "Press Enter to continue..."
        vercel
        ;;
    2)
        echo ""
        echo "🚀 Deploying to production..."
        vercel --prod
        ;;
    3)
        echo ""
        echo "👀 Creating preview deployment..."
        vercel
        ;;
    4)
        echo ""
        echo "📋 Fetching logs..."
        vercel logs
        ;;
    5)
        echo ""
        echo "🌐 Opening Vercel dashboard..."
        vercel open
        ;;
    6)
        echo ""
        echo "📊 Checking deployment status..."
        vercel list
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
