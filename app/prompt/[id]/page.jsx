"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import PromptCard from "@components/PromptCard";

const PromptDetail = ({ params: paramsPromise }) => {
  const params = use(paramsPromise);
  const [prompt, setPrompt] = useState(null);
  const [relatedPrompts, setRelatedPrompts] = useState([]);

  useEffect(() => {
    const fetchPrompt = async () => {
      const response = await fetch(`/api/prompt/${params.id}`);
      const data = await response.json();
      setPrompt(data);
    };

    const fetchRelated = async () => {
      const response = await fetch(`/api/prompt/${params.id}/related`);
      const data = await response.json();
      setRelatedPrompts(data);
    };

    if (params.id) {
      fetchPrompt();
      fetchRelated();
    }
  }, [params.id]);

  if (!prompt) return <div>Loading...</div>;

  return (
    <section className="w-full max-w-4xl mx-auto">
      <h1 className="head_text text-left mb-8">
        <span className="blue_gradient">Prompt Details</span>
      </h1>

      <PromptCard post={prompt} />

      {relatedPrompts.length > 0 && (
        <div className="mt-10">
          <h2 className="font-satoshi font-bold text-xl text-gray-900 mb-4">
            Related Prompts
          </h2>
          <div className="prompt_layout">
            {relatedPrompts.map((post) => (
              <PromptCard key={post._id} post={post} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default PromptDetail;
