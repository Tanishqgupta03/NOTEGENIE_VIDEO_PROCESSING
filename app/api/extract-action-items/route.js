import { NextResponse } from 'next/server';
import { extractActionableItems } from '@/services/actionableItemsService';

// Middleware to handle CORS
function setCORSHeaders(response) {
    response.headers.set('Access-Control-Allow-Origin', '*'); // Allow all origins (Change to 'http://localhost:3000' for stricter control)
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }

// Handle OPTIONS request (CORS preflight)
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 }); // 204 No Content
  return setCORSHeaders(response);
}

export async function POST(request, { params }) {
    try {
      console.log('Request received at /api/video/extract-action-items');
      const body = await request.json();
      const { summary } = body;
  
      // Validate required fields
      if (!summary) {
        console.error('Missing required field: summary');
        let response = NextResponse.json({ error: 'Missing required field: summary' }, { status: 400 });
        return setCORSHeaders(response);
      }
  
      console.log('Extracting actionable items...');
      const actionItems = await extractActionableItems(summary);
      console.log('Actionable items extracted:', actionItems);
  
      // Return the actionable items result
      let response = NextResponse.json(actionItems, { status: 200 });
      return setCORSHeaders(response);
    } catch (error) {
      console.error('Error extracting actionable items:', error);
      let response = NextResponse.json({ error: 'Failed to extract actionable items' }, { status: 500 });
      return setCORSHeaders(response);
    }
  }