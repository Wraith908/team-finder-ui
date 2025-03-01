import * as React from "react";
import { Controller, NestedValue, useForm } from "react-hook-form";
import classnames from "classnames";
import { useMutation } from "react-query";
import { Button } from "../../components/Button";
import { PageContainer } from "../../components/PageContainer";
import { PageHeader } from "../../components/PageHeader";
import { PageNavigator } from "../../components/PageNavigator";
import { skillsets } from "../../utils/Skillsets";
import { useHistory } from "react-router";
import { SkillsetSelector } from "../../components/SkillsetSelector";
import { NavLink } from "react-router-dom";


interface FormData {
  description: string;
  skillsets: NestedValue<number[]>;
}

interface TeamDto {
  author: string;
  description: string;
  skillsetMask: number;
}

const teamFromForm = (formData: FormData): TeamDto => {
  return {
    author: "Definitely Guitar Kid#4264",
    description: formData.description,
    skillsetMask: formData.skillsets.reduce((a, b) => a + b, 0),
  };
};

const postTeam = async (teamDto: TeamDto): Promise<TeamDto> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/teams`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(teamDto),
  });
  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText}: ${await response.text()}`
    );
  }
  return await response.json();
};

export const Register: React.FC = () => {
  const history = useHistory();

  const { mutate, error, isLoading } = useMutation(
    async (formData: FormData) => {
      const team = teamFromForm(formData);
      return postTeam(team);
    },
    {
      onSuccess: () => {
        // ordinarily, you'd also invalidate queries here...
        // but the only other query for now is the list page,
        // whose primary purpose is to see OTHER people's teams!
        // So we don't need to work too hard to make sure your own shows up
        history.push("/");
      },
    }
  );

  const { register, formState, handleSubmit, control } = useForm<FormData>({
    defaultValues: {
      description: "",
      skillsets: [],
    },
  });

  React.useEffect(() => {
    register("skillsets", {
      validate: (value) => {
        if (value.length === 0) {
          return "Required";
        }
      },
    });
  }, [register]);

  return (
    <PageContainer>
      <NavLink to="/"><img className="mt-2" src={"MainLogoSmall.png"}></img></NavLink>
      <PageNavigator/>
      <PageHeader>Register a Team</PageHeader>
      <form
        className="max-w-prose mx-auto space-y-8"
        onSubmit={handleSubmit((data) => mutate(data))}
      >
        <div className="space-y-2">
          <label
            className={classnames(
              "text-lg block",
              formState.errors.skillsets && "text-red-400"
            )}
          >
            What skillsets are you looking for from team members?
          </label>
          <Controller
            control={control}
            name="skillsets"
            render={({ field: { value, onChange } }) => (
              <SkillsetSelector selectedSkillsets={value} onChange={onChange} />
            )}
          />
          {formState.errors.skillsets && (
            <div className="text-red-400">
              {formState.errors.skillsets?.message}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label
            className={classnames(
              "text-lg block",
              formState.errors.description && "text-red-400"
            )}
            htmlFor="description"
          >
            Tell us a bit about yourself and the team you&rsquo;d like to see!
          </label>
          <textarea
            className={classnames(
              "text-md bg-transparent border  px-4 py-2 block w-full placeholder-white placeholder-opacity-40 h-40",
              formState.errors.description
                ? "border-red-400 focus:border-red-500"
                : "border-white focus:border-primary"
            )}
            maxlength = "210"
            placeholder="Hi, I'm Mark! I've been learning Unity for about a year, but this is my first jam. I like level design, and I can do a bit of programming too! I like platformers and games that make it feel good to move around. I'd love to pair up with an artist and maybe a programmer."
            id="description"
            {...register("description", { required: "Required" })}
          />
          {formState.errors.description && (
            <div className="text-red-400">
              {formState.errors.description.message}
            </div>
          )}
          <div className="prose prose-sm text-white text-opacity-70">
            <p>It&rsquo;s good to talk about:</p>
            <ul>
              <li>Your experience with game development</li>
              <li>Your experience with game jams</li>
              <li>Your specific skillset</li>
              <li>The types of games you like to work on</li>
              <li>The size of team you&rsquo;d like to work with</li>
              <li>
                Anything else you&rsquo;d like a potential teammate to know!
              </li>
            </ul>
          </div>
        </div>
        {error && (
          <div className="text-red-400">
            Sorry, there was a problem and we couldn&rsquo;t submit a team for
            you.
          </div>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </Button>
      </form>
    </PageContainer>
  );
};
