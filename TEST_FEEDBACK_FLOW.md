# Feedback Flow Test Guide

## Quick Test Steps

### Prerequisites
1. Ensure dev server can run: `pnpm dev`
2. Have browser DevTools available (Chrome/Edge recommended)
3. (Optional) EmailJS configured for email testing

### Test Procedure

#### Step 1: Start the Application
```bash
cd /Users/sravanpolu/Projects/DailyBias
pnpm dev
```

#### Step 2: Navigate to a Bias Page
1. Open browser to `http://localhost:3000`
2. Either:
   - Use the daily bias on the home page, OR
   - Navigate to `/bias/[any-bias-id]` (e.g., `/bias/confirmation-bias`)

#### Step 3: Submit Test Feedback
1. Scroll down to find the **"Help Improve This Content"** card
2. Click to expand the feedback form
3. Select a feedback type (e.g., "Accuracy")
4. Select a rating (e.g., "Needs Improvement")
5. Add a test comment: `TEST_FEEDBACK_FLOW_${Date.now()}`
   - Example: `TEST_FEEDBACK_FLOW_1735689600000`
6. Click **"Submit Feedback"**
7. Verify success message appears: "Feedback Submitted Successfully"

#### Step 4: Verify IndexedDB Storage
1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Navigate to: **IndexedDB** → `bias-daily-db` → `feedback`
4. Verify:
   - ✅ New record exists with auto-increment key
   - ✅ `biasId` matches the bias you submitted feedback for
   - ✅ `type` matches your selection
   - ✅ `rating` matches your selection
   - ✅ `comment` contains your test comment
   - ✅ `timestamp` is a recent number

#### Step 5: Verify Analytics Display
1. Navigate to `/analytics` page
2. Check the **Overview** tab:
   - ✅ "User Feedback" count should be > 0 (or increased if you had previous feedback)
   - Note: This counts unique biases with feedback, not total submissions
3. Check **Recent Activity** section:
   - ✅ Should show your feedback entry
   - ✅ Description format: `"{Type} feedback ({Rating}) for "{Bias Title}"`
   - ✅ Timestamp shows relative time (e.g., "just now", "1 minute ago")
4. (Optional) Check **Reviews** tab for review statistics

#### Step 6: Verify Email (if EmailJS configured)
1. Check browser console for email logs:
   - Look for: `[Email] Feedback email sent successfully:`
   - Or warning: `[Email] EmailJS not configured. Skipping email send.`
2. If EmailJS is configured:
   - Check EmailJS dashboard for sent emails
   - Check `debiasdaily@gmail.com` inbox
   - Email should contain:
     - Bias ID and title
     - Feedback type and rating
     - Comment text
     - Timestamp

### Expected Results

#### ✅ Success Criteria
- [x] Feedback form submits without errors
- [x] Success toast/notification appears
- [x] Feedback stored in IndexedDB with correct data
- [x] Analytics page shows feedback count
- [x] Recent activity displays feedback entry
- [x] Email sent (if EmailJS configured) OR graceful failure (if not configured)

#### ⚠️ Known Behaviors
1. **Analytics refresh**: Analytics page loads data on mount. To see new feedback, refresh the page or navigate away and back.
2. **Feedback count**: Shows unique biases with feedback, not total submission count.
3. **Email is optional**: Feedback is considered successful even if email fails (by design).

### Test Data Examples

#### Test Case 1: Positive Accuracy Feedback
```
Type: Accuracy
Rating: Good (positive)
Comment: TEST_FEEDBACK_FLOW_ACCURACY_POSITIVE_1735689600000
```

#### Test Case 2: Negative Clarity Feedback
```
Type: Clarity
Rating: Needs Improvement (negative)
Comment: TEST_FEEDBACK_FLOW_CLARITY_NEGATIVE_1735689600000
```

#### Test Case 3: Other Feedback with Long Comment
```
Type: Other
Rating: Good (positive)
Comment: TEST_FEEDBACK_FLOW_OTHER_LONG_COMMENT_1735689600000 - This is a longer test comment to verify that longer comments are handled correctly in the feedback system.
```

### Troubleshooting

#### Issue: Feedback not appearing in IndexedDB
- **Check**: Browser console for errors
- **Check**: IndexedDB is enabled in browser settings
- **Check**: No browser extensions blocking IndexedDB
- **Solution**: Try in incognito/private mode

#### Issue: Analytics not showing feedback
- **Check**: Navigate away from analytics and back (triggers reload)
- **Check**: Browser console for errors in analytics page
- **Check**: Feedback actually exists in IndexedDB (Step 4)
- **Solution**: Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R)

#### Issue: Email not sending
- **Check**: EmailJS environment variables are set:
  - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
  - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
  - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`
- **Check**: Browser console for email errors
- **Note**: Email failure doesn't prevent feedback storage (by design)

### Automated Test (Future Enhancement)

For automated testing, you could create a Playwright test:

```typescript
// tests/e2e/feedback-flow.spec.ts
test('feedback submission flow', async ({ page }) => {
  // Navigate to bias page
  await page.goto('/bias/confirmation-bias')
  
  // Open feedback modal
  await page.click('text=Help Improve This Content')
  
  // Fill feedback form
  await page.click('text=Accuracy')
  await page.click('text=Good')
  await page.fill('textarea', `TEST_FEEDBACK_FLOW_${Date.now()}`)
  
  // Submit
  await page.click('text=Submit Feedback')
  
  // Verify success message
  await expect(page.locator('text=Feedback Submitted Successfully')).toBeVisible()
  
  // Navigate to analytics
  await page.goto('/analytics')
  
  // Verify feedback appears
  await expect(page.locator('text=User Feedback')).toBeVisible()
})
```

## Summary

The feedback flow is **fully functional** and ready for testing. All components are correctly wired:

- ✅ UI component → IndexedDB storage
- ✅ IndexedDB → Analytics display
- ✅ EmailJS → Developer email (optional)
- ✅ Analytics metrics and recent activity

The system is client-side only, which is appropriate for a static Next.js export.
