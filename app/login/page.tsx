"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading,setLoading] = useState(false)
  const {data:session,status} = useSession()

  useEffect(()=>{
    if(status==='authenticated'){
      router.push('/dashboard')
    }
  },[session,status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true)
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false)
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      Swal.fire({
        text:"login successfull",
        title:"Successfull",
        icon:"success"
      })
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            email:vikashmishra8371@gmail.com
            password:123456
          </div>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            disabled={loading}
          >
            {
              loading?"Loading..":"Login"
            }
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
