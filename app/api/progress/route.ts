import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, GenerationProgress } from '@/types';

// OpenAI Sora API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1';

if (!OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY environment variable is not set');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    if (!videoId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Validate API key
    if (!OPENAI_API_KEY) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Get progress from OpenAI Sora API
    const progress = await getProgressFromOpenAI(videoId);

    return NextResponse.json<ApiResponse<GenerationProgress>>({
      success: true,
      data: progress
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getProgressFromOpenAI(videoId: string): Promise<GenerationProgress> {
  try {
    const response = await fetch(`${OPENAI_API_ENDPOINT}/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Video not found');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI Sora API error: ${response.status} - ${errorData.message || errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Transform OpenAI Sora response to our internal format
    // Map OpenAI status to progress percentage
    let progress = 0;
    let currentStep = 'Initializing';

    switch (data.status) {
      case 'pending':
        progress = 10;
        currentStep = 'Queued for processing';
        break;
      case 'processing':
        progress = 50;
        currentStep = 'Generating video';
        break;
      case 'completed':
        progress = 100;
        currentStep = 'Complete';
        break;
      case 'failed':
        progress = 0;
        currentStep = 'Failed';
        break;
      default:
        progress = 0;
        currentStep = data.status || 'Unknown';
    }

    return {
      id: data.id,
      progress: progress,
      status: data.status,
      currentStep: currentStep,
      estimatedTimeRemaining: data.estimated_time_remaining,
    };
  } catch (error) {
    console.error('Error getting progress from OpenAI:', error);
    throw error;
  }
}