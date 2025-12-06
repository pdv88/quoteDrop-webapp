import Header from '../components/Header';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-white flex flex-col">
      <Header />
      <div className="container mx-auto px-6 py-20 flex-grow">
        <h1 className="text-4xl font-bold mb-8">About Us</h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
          QuoteDrop was built to solve a problem we faced ourselves: creating professional quotes shouldn't be a hassle.
          <br /><br />
          We are a team of developers and designers passionate about helping freelancers and agencies close more deals with less effort.
        </p>
      </div>
      <Footer />
    </div>
  );
}
