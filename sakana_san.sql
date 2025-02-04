--
-- PostgreSQL database dump
--

-- Dumped from database version 14.5
-- Dumped by pg_dump version 14.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: collaborator_status_enum; Type: TYPE; Schema: public; Owner: fast-foodie-db
--

CREATE TYPE public.collaborator_status_enum AS ENUM (
    'IS_PENDING',
    'IS_ACCEPTED'
);


ALTER TYPE public.collaborator_status_enum OWNER TO "fast-foodie-db";

--
-- Name: collaborator_type_enum; Type: TYPE; Schema: public; Owner: fast-foodie-db
--

CREATE TYPE public.collaborator_type_enum AS ENUM (
    'FULL_ACCESS',
    'READ_ONLY'
);


ALTER TYPE public.collaborator_type_enum OWNER TO "fast-foodie-db";

--
-- Name: dish_status_enum; Type: TYPE; Schema: public; Owner: fast-foodie-db
--

CREATE TYPE public.dish_status_enum AS ENUM (
    'PRIVATE',
    'PUBLIC'
);


ALTER TYPE public.dish_status_enum OWNER TO "fast-foodie-db";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: collaborator; Type: TABLE; Schema: public; Owner: fast-foodie-db
--

CREATE TABLE public.collaborator (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    type public.collaborator_type_enum DEFAULT 'READ_ONLY'::public.collaborator_type_enum NOT NULL,
    status public.collaborator_status_enum DEFAULT 'IS_PENDING'::public.collaborator_status_enum NOT NULL,
    "userId" uuid NOT NULL
);


ALTER TABLE public.collaborator OWNER TO "fast-foodie-db";

--
-- Name: dish; Type: TABLE; Schema: public; Owner: fast-foodie-db
--

CREATE TABLE public.dish (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    name character varying NOT NULL,
    instructions character varying,
    status public.dish_status_enum DEFAULT 'PUBLIC'::public.dish_status_enum NOT NULL,
    "weeklyDish" boolean DEFAULT false NOT NULL,
    tags text[],
    ration integer DEFAULT 2 NOT NULL,
    "favoriteImage" character varying,
    "chefId" uuid NOT NULL
);


ALTER TABLE public.dish OWNER TO "fast-foodie-db";

--
-- Name: food; Type: TABLE; Schema: public; Owner: fast-foodie-db
--

CREATE TABLE public.food (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    name character varying NOT NULL,
    aisle character varying NOT NULL,
    icon character varying NOT NULL,
    "userId" uuid
);


ALTER TABLE public.food OWNER TO "fast-foodie-db";

--
-- Name: ingredient; Type: TABLE; Schema: public; Owner: fast-foodie-db
--

CREATE TABLE public.ingredient (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    quantity integer NOT NULL,
    unit character varying,
    "foodId" uuid,
    "dishId" uuid
);


ALTER TABLE public.ingredient OWNER TO "fast-foodie-db";

--
-- Name: media; Type: TABLE; Schema: public; Owner: fast-foodie-db
--

CREATE TABLE public.media (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    url character varying NOT NULL,
    "localPath" character varying DEFAULT ''::character varying NOT NULL,
    filename character varying DEFAULT ''::character varying NOT NULL,
    type character varying NOT NULL,
    size integer NOT NULL,
    "dishId" uuid
);


ALTER TABLE public.media OWNER TO "fast-foodie-db";

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: fast-foodie-db
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO "fast-foodie-db";

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: fast-foodie-db
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO "fast-foodie-db";

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fast-foodie-db
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: fast-foodie-db
--

CREATE TABLE public."user" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userName" character varying NOT NULL,
    password character varying NOT NULL,
    "profilePictureId" uuid,
    "managerId" uuid
);


ALTER TABLE public."user" OWNER TO "fast-foodie-db";

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: collaborator; Type: TABLE DATA; Schema: public; Owner: fast-foodie-db
--

COPY public.collaborator (id, "createdAt", "updatedAt", type, status, "userId") FROM stdin;
d093d2a8-dbc3-46ac-9b61-cb7d7009853a	2025-02-02 03:43:55.153316	2025-02-02 03:43:55.153316	READ_ONLY	IS_PENDING	e6e82c96-bdde-447c-92ae-df7a32f2bbff
1a7e69ba-7d3a-4609-88b1-d82cdbc82371	2025-02-02 03:47:20.544174	2025-02-02 03:47:20.544174	READ_ONLY	IS_PENDING	e6e82c96-bdde-447c-92ae-df7a32f2bbff
\.


--
-- Data for Name: dish; Type: TABLE DATA; Schema: public; Owner: fast-foodie-db
--

COPY public.dish (id, "createdAt", "updatedAt", name, instructions, status, "weeklyDish", tags, ration, "favoriteImage", "chefId") FROM stdin;
\.


--
-- Data for Name: food; Type: TABLE DATA; Schema: public; Owner: fast-foodie-db
--

COPY public.food (id, "createdAt", "updatedAt", name, aisle, icon, "userId") FROM stdin;
\.


--
-- Data for Name: ingredient; Type: TABLE DATA; Schema: public; Owner: fast-foodie-db
--

COPY public.ingredient (id, "createdAt", "updatedAt", quantity, unit, "foodId", "dishId") FROM stdin;
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: fast-foodie-db
--

COPY public.media (id, "createdAt", "updatedAt", url, "localPath", filename, type, size, "dishId") FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: fast-foodie-db
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1738467700619	Migrations1738467700619
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: fast-foodie-db
--

COPY public."user" (id, "createdAt", "updatedAt", "userName", password, "profilePictureId", "managerId") FROM stdin;
e6e82c96-bdde-447c-92ae-df7a32f2bbff	2025-02-02 03:42:02.941914	2025-02-02 03:42:02.941914	noe	$2a$10$tlAxcLz3aq/I51/B7l9E4.UblTLqTDtLIIPzFMpx5BTTUtOozANwe	\N	\N
ce1e0cba-4ba9-41c3-8752-220c50666184	2025-02-02 03:42:09.769906	2025-02-02 03:42:09.769906	ju	$2a$10$kT/IF5QWIwPEp1GeYDdrWOy.xY3q/GOSKEIsnddIcIjDFIo2gBu6.	\N	\N
38c11c32-8eff-4d70-b1e9-49bade2d1ea7	2025-02-02 03:47:45.535343	2025-02-02 03:47:45.535343	noe2	$2a$10$nJqxAECIhpz55WlbeYBq6Ot5sx.D8rzHYeA5Keb.2yt0yjzz1t7Oq	\N	\N
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fast-foodie-db
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, true);


--
-- Name: food PK_26d12de4b6576ff08d30c281837; Type: CONSTRAINT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public.food
    ADD CONSTRAINT "PK_26d12de4b6576ff08d30c281837" PRIMARY KEY (id);


--
-- Name: dish PK_59ac7b35af39b231276bfc4c00c; Type: CONSTRAINT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public.dish
    ADD CONSTRAINT "PK_59ac7b35af39b231276bfc4c00c" PRIMARY KEY (id);


--
-- Name: ingredient PK_6f1e945604a0b59f56a57570e98; Type: CONSTRAINT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public.ingredient
    ADD CONSTRAINT "PK_6f1e945604a0b59f56a57570e98" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: collaborator PK_aa48142926d7bdb485d21ad2696; Type: CONSTRAINT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public.collaborator
    ADD CONSTRAINT "PK_aa48142926d7bdb485d21ad2696" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: media PK_f4e0fcac36e050de337b670d8bd; Type: CONSTRAINT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY (id);


--
-- Name: user REL_f58f9c73bc58e409038e56a405; Type: CONSTRAINT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "REL_f58f9c73bc58e409038e56a405" UNIQUE ("profilePictureId");


--
-- Name: ingredient FK_04fb9dfaa7954d6aad75f5e406e; Type: FK CONSTRAINT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public.ingredient
    ADD CONSTRAINT "FK_04fb9dfaa7954d6aad75f5e406e" FOREIGN KEY ("foodId") REFERENCES public.food(id) ON DELETE CASCADE;


--
-- Name: media FK_128abc0f24534d6f32ba699dc95; Type: FK CONSTRAINT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT "FK_128abc0f24534d6f32ba699dc95" FOREIGN KEY ("dishId") REFERENCES public.dish(id) ON DELETE CASCADE;


--
-- Name: food FK_5ed8e55796b747240eff8d82b8a; Type: FK CONSTRAINT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public.food
    ADD CONSTRAINT "FK_5ed8e55796b747240eff8d82b8a" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: ingredient FK_7c9b1a5446b05b56654617af02c; Type: FK CONSTRAINT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public.ingredient
    ADD CONSTRAINT "FK_7c9b1a5446b05b56654617af02c" FOREIGN KEY ("dishId") REFERENCES public.dish(id) ON DELETE CASCADE;


--
-- Name: dish FK_8d7bf18dc0b2cdc04267c240b6f; Type: FK CONSTRAINT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public.dish
    ADD CONSTRAINT "FK_8d7bf18dc0b2cdc04267c240b6f" FOREIGN KEY ("chefId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: collaborator FK_b2614ee1839e47abc4cdc62500f; Type: FK CONSTRAINT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public.collaborator
    ADD CONSTRAINT "FK_b2614ee1839e47abc4cdc62500f" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: user FK_df69481de1f438f2082e4d54749; Type: FK CONSTRAINT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_df69481de1f438f2082e4d54749" FOREIGN KEY ("managerId") REFERENCES public."user"(id);


--
-- Name: user FK_f58f9c73bc58e409038e56a4055; Type: FK CONSTRAINT; Schema: public; Owner: fast-foodie-db
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_f58f9c73bc58e409038e56a4055" FOREIGN KEY ("profilePictureId") REFERENCES public.media(id);


--
-- PostgreSQL database dump complete
--

