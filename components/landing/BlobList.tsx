"use client";
import { useEffect, useState } from "react";

export default function BlobList({ container }: { container: string }) {
  const [blobs, setBlobs] = useState<string[]>([]);
  useEffect(() => {
    fetch(`/api/azure/list-blobs?container=${container}`)
      .then((res) => res.json())
      .then((data) => setBlobs(data.blobs || []));
  }, [container]);
  return (
    <ul>
      {blobs.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
}
