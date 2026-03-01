import { SigninForm } from './SigninForm';
import { SigninFooter } from './SigninFooter';

export default function SigninPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex items-center justify-center px-4">
        <SigninForm />
      </div>
      <SigninFooter className="mt-8" />
    </div>
  );
}
