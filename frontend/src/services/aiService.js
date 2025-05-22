export async function generateCourse(topic, level) {
  const res = await fetch(`http://localhost:3000/courses/generate?topic=${topic}&level=${level}`);
  if (!res.ok) {
    throw new Error('Failed to fetch course');
  }
  const text = await res.text(); // response is a string, not JSON
  return text;
}