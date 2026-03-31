import { DRIVE_FILE_NAME } from "./constants"
import { DEFAULT_USER_DATA, type UserData } from "@/types/models"

const BASE_URL = "https://www.googleapis.com/drive/v3/files"
const UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files"

async function driveRequest(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Google Drive API error (${res.status}): ${error}`)
  }
  return res
}

export async function findAppDataFile(
  token: string
): Promise<{ id: string; name: string } | null> {
  const res = await driveRequest(
    `${BASE_URL}?spaces=appDataFolder&q=name='${DRIVE_FILE_NAME}'&fields=files(id,name)`,
    token
  )
  const data = await res.json()
  return data.files?.[0] ?? null
}

export async function readFile(
  token: string,
  fileId: string
): Promise<UserData> {
  const res = await driveRequest(
    `${BASE_URL}/${fileId}?alt=media`,
    token
  )
  return res.json()
}

export async function createFile(
  token: string,
  content: UserData
): Promise<string> {
  const metadata = {
    name: DRIVE_FILE_NAME,
    parents: ["appDataFolder"],
    mimeType: "application/json",
  }

  const form = new FormData()
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  )
  form.append(
    "file",
    new Blob([JSON.stringify(content)], { type: "application/json" })
  )

  const res = await driveRequest(`${UPLOAD_URL}?uploadType=multipart`, token, {
    method: "POST",
    body: form,
  })
  const data = await res.json()
  return data.id
}

export async function updateFile(
  token: string,
  fileId: string,
  content: UserData
): Promise<void> {
  await driveRequest(
    `${UPLOAD_URL}/${fileId}?uploadType=media`,
    token,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    }
  )
}

export async function loadOrCreateData(
  token: string
): Promise<{ data: UserData; fileId: string }> {
  const existing = await findAppDataFile(token)
  if (existing) {
    const data = await readFile(token, existing.id)
    return { data, fileId: existing.id }
  }
  const fileId = await createFile(token, DEFAULT_USER_DATA)
  return { data: { ...DEFAULT_USER_DATA }, fileId }
}
