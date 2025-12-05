import { NextRequest, NextResponse } from 'next/server';
import { SoraVideoRequest, SoraVideoResponse, ApiResponse } from '@/types';

// OpenAI Sora API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1';

if (!OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY environment variable is not set');
}

export async function POST(request: NextRequest) {
  try {
    const body: SoraVideoRequest = await request.json();

    // Validate request
    if (!body.prompt || typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Prompt is required and must be a non-empty string' },
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

    // Call OpenAI Sora API to generate video
    const soraResponse = await callOpenAISoraAPI(body);

    return NextResponse.json<ApiResponse<SoraVideoResponse>>({
      success: true,
      data: soraResponse,
      message: 'Video generation started successfully'
    });

  } catch (error) {
    console.error('Error in video generation:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    if (!OPENAI_API_KEY) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    if (!videoId) {
      // For now, return empty array (can be enhanced to use GET /v1/videos for listing)
      return NextResponse.json<ApiResponse<SoraVideoResponse[]>>({
        success: true,
        data: [],
        message: 'Video listing - provide a video ID to retrieve specific video status.'
      });
    }

    // Get video status from OpenAI Sora API
    const videoStatus = await getVideoStatusFromOpenAI(videoId);

    return NextResponse.json<ApiResponse<SoraVideoResponse>>({
      success: true,
      data: videoStatus
    });

  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function callOpenAISoraAPI(request: SoraVideoRequest): Promise<SoraVideoResponse> {
  try {
    // Determine model based on resolution
    const model = request.resolution === '4k' ? 'sora-2-pro' : 'sora-2';

    const response = await fetch(`${OPENAI_API_ENDPOINT}/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: request.prompt.trim(),
        duration: request.duration || 10,
        resolution: request.resolution || '1080p',
        style: request.style || 'realistic',
        aspect_ratio: request.aspectRatio || '16:9',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI Sora API error: ${response.status} - ${errorData.message || errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Transform OpenAI Sora response to our internal format
    return {
      id: data.id,
      status: data.status || 'pending',
      prompt: request.prompt,
      videoUrl: data.video_url || data.url,
      thumbnailUrl: data.thumbnail_url,
      duration: request.duration,
      resolution: request.resolution,
      style: request.style,
      aspectRatio: request.aspectRatio,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
      error: data.error,
    };
  } catch (error) {
    console.error('Error calling OpenAI Sora API:', error);
    throw error;
  }
}

async function getVideoStatusFromOpenAI(videoId: string): Promise<SoraVideoResponse> {
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
    return {
      id: data.id,
      status: data.status || 'pending',
      prompt: data.prompt || '',
      videoUrl: data.video_url || data.url,
      thumbnailUrl: data.thumbnail_url,
      duration: data.duration,
      resolution: data.resolution,
      style: data.style,
      aspectRatio: data.aspect_ratio,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
      error: data.error,
    };
  } catch (error) {
    console.error('Error getting video status from OpenAI:', error);
    throw error;
  }
}