
"use client";
export function AuthPage({isSignin}:{
    isSignin: boolean
}){
    return <div className="w-screen h-screen flex justify-center items-center">
      <div className="p-2 m-2 bg-white rounded">
        <input type="
        text" placeholder="Email" />
        <input type="password" placeholder="Password" ></input>
        <button onClick={()=>{
            if(isSignin){
                // handle sign in
            }else{
                // handle sign up
            }
        }}>{isSignin ? "Sign In" : "Sign Up"}

        </button>
     
      </div>
    </div>
}