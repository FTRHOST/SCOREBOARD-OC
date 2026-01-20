
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const teamsFilePath = path.join(process.cwd(), 'src', 'lib', 'teams.json');

export async function GET() {
  try {
    const fileContent = await fs.readFile(teamsFilePath, 'utf-8');
    const teams = JSON.parse(fileContent);
    return NextResponse.json(teams);
  } catch (error) {
    // If the file doesn't exist, return an empty array.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json([]);
    }
    return new NextResponse('Error reading teams file', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const teams = body.teams;
    if (!Array.isArray(teams)) {
      return new NextResponse('Invalid data format', { status: 400 });
    }
    await fs.writeFile(teamsFilePath, JSON.stringify(teams, null, 2));
    return new NextResponse('Teams saved successfully', { status: 200 });
  } catch (error) {
    return new NextResponse('Error writing teams file', { status: 500 });
  }
}
