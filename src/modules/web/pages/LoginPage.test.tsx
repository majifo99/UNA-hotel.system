/**
 * TEST LOGIN PAGE - Simple version for debugging
 */

export function LoginPageTest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Login Test</h1>
        <p className="text-gray-600">
          Si ves esto, el problema NO es con el routing.
        </p>
        <p className="text-gray-600 mt-4">
          El problema probablemente está en:
        </p>
        <ul className="list-disc list-inside text-gray-600 mt-2">
          <li>useAuth hook</li>
          <li>AuthProvider</li>
          <li>react-hook-form</li>
          <li>Alguna dependencia</li>
        </ul>
      </div>
    </div>
  );
}
