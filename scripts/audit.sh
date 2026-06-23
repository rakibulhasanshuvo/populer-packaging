#!/bin/bash
echo "Starting frontend audits..."
npx lighthouse http://localhost:3000/home --output html --output-path ./audit-home.html --quiet --chrome-flags="--headless"
npx lighthouse http://localhost:3000/orders --output html --output-path ./audit-orders.html --quiet --chrome-flags="--headless"
npx lighthouse http://localhost:3000/products --output html --output-path ./audit-products.html --quiet --chrome-flags="--headless"
npx lighthouse http://localhost:3000/analytics --output html --output-path ./audit-analytics.html --quiet --chrome-flags="--headless"
echo "Frontend audits completed. Reports saved as audit-*.html"
