import { Layout } from 'src/components/routing/layout/layout';
import { CONTENT_POLICY_ROUTE } from './content-policy-routes';

export function ContentPolicyTemplate() {
  return (
    <Layout title={CONTENT_POLICY_ROUTE.title}>
      {() => (
        <>
          <div className="container">
            <div className="d-flex align-items-end justify-content-between">
              <h1 id="content-policy">Content Policy</h1>
              <p className="text-muted">14th February, 2022</p>
            </div>
            <h1 id="content-policy">Content Policy</h1>
            <h2 id="definitions">1. Definitions</h2>
            <p>
              &quot;<b>Content</b>&quot; shall mean any work of authorship,
              creative works, graphics, images, textures, photos, logos, video,
              audio, text and interactive features, including without limitation
              NFTs, submitted by the Users of 8Land.
            </p>
            <p>
              &quot;<b>Intellectual Property Rights</b>&quot; shall mean rights
              in, arising out of, or associated with intellectual property in
              any jurisdiction, including without limitation rights in or
              arising out of, or associated with (1) copyrights, mask work
              rights, and other rights in published and unpublished works of
              authorship, including without limitation computer programs,
              databases, graphics, user interfaces, and similar works; (2)
              patents, design rights, and other rights in inventions and
              discoveries, including without limitation articles of manufacture,
              business methods, compositions of matter, improvements, machines,
              methods, and processes; (3) trademarks, service marks, trade dress
              and other logos and similar indications of origin of, or
              association with, a group, business, good, product, or service;
              (4) trade secrets and other information that is not generally
              known or readily ascertainable by third parties through proper
              means, whether tangible or intangible, including without
              limitation algorithms, customer lists, ideas, designs, formulas,
              know-how, source code, methods, processes, programs, prototypes,
              systems, and techniques; (5) a person&apos;s name, voice,
              signature, photograph, or likeness, including without limitation
              rights of personality, privacy, and publicity; (6) attribution and
              integrity and other so-called moral rights of an author; (7)
              internet domain names; (8) data and databases; and (9) similar
              proprietary rights arising under the laws of any jurisdiction
            </p>
            <p>
              &quot;<b>NFT</b>&quot; means non-fungible token. All NFTs must
              comply with this Content Policy in accordance with section 12.4 of
              the Terms of Use.
            </p>
            <h2 id="prohibited-content">2. Prohibited Content</h2>
            <p>
              All Content uploaded, posted, created, displayed, transmitted or
              made available by the User through the Tools must not include:
            </p>
            <p>
              2.1. Content involving illegality, such as piracy, criminal
              activity, terrorism, obscenity, child pornography, gambling
              (subject to Section 3 below), and illegal drug use.
            </p>
            <p>
              2.2. Content infringing third party Intellectual Property Rights.
            </p>
            <p>
              2.3. Cruel or hateful Content that could harm, harass, promote or
              condone violence against, or that is primarily intended to incite
              hatred of, animals, or individuals or groups based on race or
              ethnic origin, religion, nationality, disability, gender, age,
              veteran status, or sexual orientation/gender identity.
            </p>
            <p>
              2.4. Content that is libelous, false, inaccurate, misleading, or
              invades another person&apos;s privacy.
            </p>
            <p>
              2.5. Content that breaches the Privacy Policy or applicable data
              privacy laws.
            </p>
            <p>
              2.6. Content that promotes or could be construed as primarily
              intended to evade the limitations above.
            </p>
            <h2 id="gambling">3. Gambling</h2>
            <p>
              If your Content involves gambling, the following shall apply: (i)
              if you reside in a jurisdiction which requires a license for
              online gambling, you must obtain such license prior to making your
              Content available; (ii) you must be in full compliance with the
              regulations of your country of residence; (iii) you must geo-block
              your Content for IPs from jurisdictions where online gambling is
              banned (including, without limitation, the United States of
              America, South Korea and China) and (iv) you must include in the
              terms and conditions of use of your Content (if any) a release
              from liability in favor of the Project to the fullest extent
              allowed by applicable law vis a vis you and the users of your
              Content.
            </p>
            <h2 id="breaches-of-this-policy">4. Breaches of this Policy</h2>
            <p>
              Any Content in infringement of Section 2, may be blocked and upon
              blocking shall not be available to other users of the Tools.
              Moreover, infringing Content may result in suspension of the
              Account, court orders, civil actions, injunctions, criminal
              prosecutions and other legal consequences brought by the Project,
              or third parties against the creator, distributor and/or user of
              said infringing Content. The User&apos;s Account may also be
              terminated in accordance with Section 15 of the Terms of Use.
            </p>
            <h2 id="age-restricted-content">5. Age-Restricted Content</h2>
            <p>
              Any Content which qualifies as (i) intensely violent or graphic,
              (ii) gambling or (ii) sexually explicit, shall only be available
              to people aged 18 or older. If you upload, post, create, display,
              transmit or make available such Content on the Tools, you must
              provide sufficient warning as to this restriction. Failure to do
              so may result in termination of your Account pursuant to Section
              15 of the Terms.
            </p>
            <h2 id="user-representations-and-warranties">
              6. User Representations and Warranties
            </h2>
            <p>
              You represent and warrant that at any time you submit Content, you
              are at least the age of majority in the jurisdiction in which you
              reside and are the parent or legal guardian, or have all proper
              consents from the parent or legal guardian, of any minor who is
              depicted in or contributed to any Content you submit, and that, as
              to that Content, (a) you are the sole author and owner of the
              Intellectual Property Rights to such Content, or you have a lawful
              right to submit the Content, all without any obligation to obtain
              consent of any third party and without creating any obligation or
              liability for the Project; (b) the Content is accurate; (c) the
              Content does not and will not infringe any Intellectual Property
              Right of any third party; and (d) the User Content will not
              violate the Terms or this Content Policy, or cause injury or harm
              to any person.
            </p>
            <p>
              You expressly acknowledge and accept that the Content you submit
              will be accessible to and viewable by other users and waive any
              claim with regards to the Project, its directors, officers,
              employees and affiliates in connection with said third party
              access. You can withdraw your Content at any time you wish.
            </p>
            <p>
              Please remember that the Content that you submit will be
              accessible to and viewable by other users. Except as may be
              required to register and/or maintain your Account, do not submit
              personally identifiable information (e.g. first and last name
              together, password, phone number, address, credit or debit card
              number, medical information, e-mail address, or other contact
              information) on the Tools.
            </p>
            <h2 id="storage">7. Storage.</h2>
            <p>
              You acknowledge that due to the centralized and decentralized
              nature of 8Land and of the blockchain technology, all Content and
              information submitted by you is stored in a centralized server and
              in several decentralized nodes (the &quot;<b>Nodes</b>&quot;).
              Thus, the Project is not liable for any loss of content or
              information.
            </p>
            <h2 id="limitations-to-liability">8. Limitations to Liability</h2>
            <p>
              The Project, its officers, and employees are not responsible or
              liable for the Content, conduct, or services of users or third
              parties. The Project, its officers, and employees do not control
              or endorse the Content of communications between users or
              users&apos; interactions with each other or the Tools.
            </p>
            <p>
              You acknowledge that you will be exposed to various aspects of the
              Tools involving the conduct, Content, and services of users, and
              that the Project does not control and is not responsible or liable
              for the quality, safety, legality, truthfulness or accuracy of any
              such user conduct, Content or user services. You acknowledge that
              the Project does not guarantee the accuracy of information
              submitted by any user of the Tools, nor any identity information
              about any user. Your interactions with other users and your use of
              Content are entirely at your own risk. The Project has no
              obligation to become involved in any dispute that you may have or
              claim to have with one or more users of the Tools, or in any
              manner in any resolution thereof.
            </p>
            <p>
              THE TOOLS MAY CONTAIN LINKS TO OR OTHERWISE ALLOW CONNECTIONS TO
              THIRD-PARTY WEBSITES, SERVERS, AND ONLINE SERVICES OR ENVIRONMENTS
              THAT ARE NOT OWNED OR CONTROLLED BY THE PROJECT. THE PROJECT, ITS
              OFFICERS, AND EMPLOYEES ARE NOT RESPONSIBLE OR LIABLE FOR THE
              CONTENT, POLICIES OR PRACTICES OF ANY THIRD-PARTY WEBSITES,
              SERVERS OR ONLINE SERVICES OR ENVIRONMENTS. Please consult any
              applicable terms of use and privacy policies provided by the third
              party for such websites, servers or online services or
              environments.
            </p>
            <p>
              You acknowledge that the Content of the Tools is provided or made
              available to you under license from independent Content Providers,
              including other users of the Tools (&quot;<b>Content Providers</b>
              &quot;). You acknowledge and agree that except as expressly
              provided in this Agreement, the Intellectual Property Rights of
              other Content Providers in their respective Content are not
              licensed to you by your mere use of the Tools. You must obtain
              from the applicable Content Providers any necessary license rights
              in Content that you desire to use or access.
            </p>
            <p>
              You copy and use Content at your own risk. You are solely
              responsible and liable for your use, reproduction, distribution,
              modification, display, or performance of any Content in violation
              of any Intellectual Property Rights. You agree that the Project
              will have no liability for, and you agree to defend, indemnify,
              and hold the Project harmless from, any claims, losses or damages
              arising out of or in connection with your use, reproduction,
              distribution, modification, display, or performance of any
              Content.
            </p>
            <h2 id="changes-to-this-policy">8. Changes to this Policy.</h2>
            <p>
              The Project may change this Content Policy from time to time. All
              users have the obligation to be aware of the updated versions of
              this Policy.
            </p>
          </div>
        </>
      )}
    </Layout>
  );
}
